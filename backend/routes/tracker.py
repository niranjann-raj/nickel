import os
import json
import logging
from datetime import datetime, date, timedelta
from decimal import Decimal, ROUND_HALF_UP
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, or_, and_, desc, asc

from models import db, User, TrackerCategory, TrackerTransaction, BillUpload, TrackerSubscription, CategoryBudget
from services.bill_extractor import (
    validate_file,
    compute_file_hash,
    save_bill_file,
    process_bill_document,
    check_for_duplicate,
    get_upload_dir
)

tracker_bp = Blueprint('tracker', __name__)
logger = logging.getLogger(__name__)


def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(user_id)


def parse_date(date_str: str, default: date = None) -> date:
    if not date_str:
        return default
    try:
        return datetime.strptime(date_str, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return default


# =============================================================================
# Categories Endpoints
# =============================================================================

@tracker_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # System categories or user custom categories
    categories = TrackerCategory.query.filter(
        or_(TrackerCategory.is_system == True, TrackerCategory.user_id == user.id)
    ).order_by(TrackerCategory.is_system.desc(), TrackerCategory.name.asc()).all()

    return jsonify({'categories': [c.to_dict() for c in categories]}), 200


@tracker_bp.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({'error': 'Category name is required'}), 400

    cat_type = data.get('type', 'EXPENSE').upper()
    if cat_type not in ('EXPENSE', 'INCOME', 'BOTH'):
        cat_type = 'EXPENSE'

    # Check for existing category for this user
    existing = TrackerCategory.query.filter(
        and_(
            TrackerCategory.name.ilike(name),
            or_(TrackerCategory.is_system == True, TrackerCategory.user_id == user.id)
        )
    ).first()
    if existing:
        return jsonify({'error': f"Category '{name}' already exists"}), 400

    icon = data.get('icon', 'Tag')
    color = data.get('color', '#888888')

    category = TrackerCategory(
        user_id=user.id,
        name=name,
        icon=icon,
        color=color,
        type=cat_type,
        is_system=False
    )
    db.session.add(category)
    db.session.commit()

    return jsonify({'category': category.to_dict()}), 201


@tracker_bp.route('/categories/<int:cat_id>', methods=['DELETE'])
@jwt_required()
def delete_category(cat_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    category = TrackerCategory.query.get(cat_id)
    if not category:
        return jsonify({'error': 'Category not found'}), 404

    if category.is_system or category.user_id != user.id:
        return jsonify({'error': 'Cannot delete system categories or categories owned by other users'}), 403

    db.session.delete(category)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Category deleted'}), 200


# =============================================================================
# Transactions CRUD
# =============================================================================

@tracker_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    tx_type = request.args.get('type')
    category_name = request.args.get('category')
    search = (request.args.get('search') or '').strip()
    start_date = parse_date(request.args.get('start_date'))
    end_date = parse_date(request.args.get('end_date'))
    sort_by = request.args.get('sort_by', 'date_desc')
    page = max(1, request.args.get('page', 1, type=int))
    limit = min(100, max(1, request.args.get('limit', 15, type=int)))

    query = TrackerTransaction.query.filter_by(user_id=user.id)

    if tx_type and tx_type.upper() in ('EXPENSE', 'INCOME'):
        query = query.filter(TrackerTransaction.type == tx_type.upper())

    if category_name and category_name != 'All':
        query = query.filter(TrackerTransaction.category_name == category_name)

    if start_date:
        query = query.filter(TrackerTransaction.transaction_date >= start_date)
    if end_date:
        query = query.filter(TrackerTransaction.transaction_date <= end_date)

    if search:
        search_filter = or_(
            TrackerTransaction.merchant.ilike(f"%{search}%"),
            TrackerTransaction.description.ilike(f"%{search}%"),
            TrackerTransaction.category_name.ilike(f"%{search}%"),
            TrackerTransaction.tags.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)

    # Sorting
    if sort_by == 'date_asc':
        query = query.order_by(asc(TrackerTransaction.transaction_date), asc(TrackerTransaction.id))
    elif sort_by == 'amount_desc':
        query = query.order_by(desc(TrackerTransaction.amount), desc(TrackerTransaction.transaction_date))
    elif sort_by == 'amount_asc':
        query = query.order_by(asc(TrackerTransaction.amount), desc(TrackerTransaction.transaction_date))
    else:  # date_desc default
        query = query.order_by(desc(TrackerTransaction.transaction_date), desc(TrackerTransaction.id))

    total_count = query.count()
    paginated = query.offset((page - 1) * limit).limit(limit).all()

    total_pages = (total_count + limit - 1) // limit if total_count > 0 else 1

    return jsonify({
        'transactions': [t.to_dict() for t in paginated],
        'total_count': total_count,
        'page': page,
        'limit': limit,
        'total_pages': total_pages
    }), 200


@tracker_bp.route('/transactions', methods=['POST'])
@jwt_required()
def create_transaction():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}

    tx_type = (data.get('type') or 'EXPENSE').upper()
    if tx_type not in ('EXPENSE', 'INCOME'):
        return jsonify({'error': 'Transaction type must be EXPENSE or INCOME'}), 400

    raw_amount = data.get('amount')
    try:
        amount = Decimal(str(raw_amount)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        if amount <= 0:
            return jsonify({'error': 'Amount must be greater than zero'}), 400
    except Exception:
        return jsonify({'error': 'Invalid amount value'}), 400

    category_name = (data.get('category_name') or '').strip()
    if not category_name:
        return jsonify({'error': 'Category is required'}), 400

    tx_date_str = data.get('transaction_date')
    tx_date = parse_date(tx_date_str, date.today())
    if not tx_date:
        return jsonify({'error': 'Invalid transaction date'}), 400

    merchant = (data.get('merchant') or '').strip()
    payment_method = (data.get('payment_method') or 'UPI').strip()
    description = (data.get('description') or '').strip()
    currency = (data.get('currency') or 'INR').strip().upper()
    bill_upload_id = data.get('bill_upload_id')
    is_subscription = bool(data.get('is_subscription', False))

    tags_val = data.get('tags', '')
    if isinstance(tags_val, list):
        tags_str = ','.join([str(t).strip() for t in tags_val if str(t).strip()])
    else:
        tags_str = str(tags_val).strip()

    # Verify bill_upload_id ownership if provided
    receipt_filename = None
    if bill_upload_id:
        upload = BillUpload.query.filter_by(id=bill_upload_id, user_id=user.id).first()
        if upload:
            receipt_filename = upload.original_filename

    tx = TrackerTransaction(
        user_id=user.id,
        type=tx_type,
        amount=amount,
        currency=currency,
        category_name=category_name,
        merchant=merchant,
        transaction_date=tx_date,
        payment_method=payment_method,
        description=description,
        tags=tags_str,
        receipt_filename=receipt_filename,
        bill_upload_id=bill_upload_id,
        is_subscription=is_subscription
    )
    db.session.add(tx)
    db.session.commit()

    return jsonify({'transaction': tx.to_dict()}), 201


@tracker_bp.route('/transactions/<int:tx_id>', methods=['GET'])
@jwt_required()
def get_transaction(tx_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    tx = TrackerTransaction.query.filter_by(id=tx_id, user_id=user.id).first()
    if not tx:
        return jsonify({'error': 'Transaction not found'}), 404

    return jsonify({'transaction': tx.to_dict()}), 200


@tracker_bp.route('/transactions/<int:tx_id>', methods=['PUT'])
@jwt_required()
def update_transaction(tx_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    tx = TrackerTransaction.query.filter_by(id=tx_id, user_id=user.id).first()
    if not tx:
        return jsonify({'error': 'Transaction not found'}), 404

    data = request.get_json() or {}

    if 'type' in data:
        tx_type = data['type'].upper()
        if tx_type in ('EXPENSE', 'INCOME'):
            tx.type = tx_type

    if 'amount' in data:
        try:
            amount = Decimal(str(data['amount'])).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            if amount <= 0:
                return jsonify({'error': 'Amount must be greater than zero'}), 400
            tx.amount = amount
        except Exception:
            return jsonify({'error': 'Invalid amount value'}), 400

    if 'category_name' in data:
        c_name = str(data['category_name']).strip()
        if c_name:
            tx.category_name = c_name

    if 'transaction_date' in data:
        parsed = parse_date(data['transaction_date'])
        if parsed:
            tx.transaction_date = parsed

    if 'merchant' in data:
        tx.merchant = str(data['merchant']).strip()

    if 'payment_method' in data:
        tx.payment_method = str(data['payment_method']).strip()

    if 'description' in data:
        tx.description = str(data['description']).strip()

    if 'tags' in data:
        tags_val = data['tags']
        if isinstance(tags_val, list):
            tx.tags = ','.join([str(t).strip() for t in tags_val if str(t).strip()])
        else:
            tx.tags = str(tags_val).strip()

    if 'is_subscription' in data:
        tx.is_subscription = bool(data['is_subscription'])

    db.session.commit()
    return jsonify({'transaction': tx.to_dict()}), 200


@tracker_bp.route('/transactions/<int:tx_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(tx_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    tx = TrackerTransaction.query.filter_by(id=tx_id, user_id=user.id).first()
    if not tx:
        return jsonify({'error': 'Transaction not found'}), 404

    db.session.delete(tx)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Transaction deleted successfully'}), 200


# =============================================================================
# Summary & Analytics
# =============================================================================

@tracker_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_summary():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    today = date.today()
    first_of_month = today.replace(day=1)
    start_date = parse_date(request.args.get('start_date'), first_of_month)
    end_date = parse_date(request.args.get('end_date'), today)

    if start_date > end_date:
        start_date, end_date = end_date, start_date

    period_days = max(1, (end_date - start_date).days + 1)

    # Current period totals using decimal aggregation
    current_txs = TrackerTransaction.query.filter(
        TrackerTransaction.user_id == user.id,
        TrackerTransaction.transaction_date >= start_date,
        TrackerTransaction.transaction_date <= end_date
    ).all()

    total_income = Decimal('0.00')
    total_expenses = Decimal('0.00')
    category_expenses = {}

    for tx in current_txs:
        amt = Decimal(str(tx.amount))
        if tx.type == 'INCOME':
            total_income += amt
        else:
            total_expenses += amt
            cat = tx.category_name or 'Other'
            category_expenses[cat] = category_expenses.get(cat, Decimal('0.00')) + amt

    net_cash_flow = total_income - total_expenses
    avg_daily_spending = (total_expenses / Decimal(str(period_days))).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    # Largest spending category
    largest_cat_name = "None"
    largest_cat_amount = Decimal('0.00')
    largest_cat_percentage = 0.0

    if category_expenses:
        sorted_cats = sorted(category_expenses.items(), key=lambda x: x[1], reverse=True)
        largest_cat_name = sorted_cats[0][0]
        largest_cat_amount = sorted_cats[0][1]
        if total_expenses > 0:
            largest_cat_percentage = float((largest_cat_amount / total_expenses * Decimal('100')).quantize(Decimal('0.1')))

    # Subscriptions monthly cost run rate
    active_subs = TrackerSubscription.query.filter_by(user_id=user.id, status='ACTIVE').all()
    monthly_sub_cost = Decimal('0.00')
    for s in active_subs:
        s_amt = Decimal(str(s.amount))
        if s.billing_cycle == 'YEARLY':
            monthly_sub_cost += (s_amt / Decimal('12.0')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        elif s.billing_cycle == 'QUARTERLY':
            monthly_sub_cost += (s_amt / Decimal('3.0')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        elif s.billing_cycle == 'WEEKLY':
            monthly_sub_cost += (s_amt * Decimal('4.333')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        else:
            monthly_sub_cost += s_amt

    # Previous period comparison (same duration immediately preceding start_date)
    prev_end_date = start_date - timedelta(days=1)
    prev_start_date = prev_end_date - timedelta(days=period_days - 1)

    prev_txs = TrackerTransaction.query.filter(
        TrackerTransaction.user_id == user.id,
        TrackerTransaction.transaction_date >= prev_start_date,
        TrackerTransaction.transaction_date <= prev_end_date
    ).all()

    prev_expenses = Decimal('0.00')
    prev_income = Decimal('0.00')
    for tx in prev_txs:
        amt = Decimal(str(tx.amount))
        if tx.type == 'INCOME':
            prev_income += amt
        else:
            prev_expenses += amt

    # Differences & percentage changes (safe against division by zero)
    def calc_change(current: Decimal, previous: Decimal):
        diff = current - previous
        if previous > 0:
            pct = float(((diff / previous) * Decimal('100')).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP))
        elif current > 0:
            pct = 100.0
        else:
            pct = 0.0
        return float(diff), pct

    expense_diff, expense_pct = calc_change(total_expenses, prev_expenses)
    income_diff, income_pct = calc_change(total_income, prev_income)

    return jsonify({
        'period': {
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'days_count': period_days
        },
        'previous_period': {
            'start_date': prev_start_date.isoformat(),
            'end_date': prev_end_date.isoformat(),
        },
        'totals': {
            'total_income': float(total_income),
            'total_expenses': float(total_expenses),
            'net_cash_flow': float(net_cash_flow),
            'average_daily_spending': float(avg_daily_spending),
            'transaction_count': len(current_txs),
            'monthly_subscription_cost': float(monthly_sub_cost)
        },
        'largest_category': {
            'name': largest_cat_name,
            'amount': float(largest_cat_amount),
            'percentage': largest_cat_percentage
        },
        'comparison': {
            'previous_expenses': float(prev_expenses),
            'previous_income': float(prev_income),
            'expense_change_amount': expense_diff,
            'expense_change_percentage': expense_pct,
            'income_change_amount': income_diff,
            'income_change_percentage': income_pct
        }
    }), 200


@tracker_bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    today = date.today()
    first_of_month = today.replace(day=1)
    start_date = parse_date(request.args.get('start_date'), first_of_month)
    end_date = parse_date(request.args.get('end_date'), today)
    trend_interval = request.args.get('trend_interval', 'daily')  # daily | weekly | monthly

    if start_date > end_date:
        start_date, end_date = end_date, start_date

    txs = TrackerTransaction.query.filter(
        TrackerTransaction.user_id == user.id,
        TrackerTransaction.transaction_date >= start_date,
        TrackerTransaction.transaction_date <= end_date
    ).order_by(asc(TrackerTransaction.transaction_date)).all()

    # 1. Spending Trend
    trend_dict = {}
    curr = start_date
    while curr <= end_date:
        if trend_interval == 'monthly':
            key = curr.strftime('%Y-%m')
            label = curr.strftime('%b %Y')
        elif trend_interval == 'weekly':
            # Monday of the week
            week_start = curr - timedelta(days=curr.weekday())
            key = week_start.strftime('%Y-%m-%d')
            label = f"Wk of {week_start.strftime('%b %d')}"
        else:
            key = curr.strftime('%Y-%m-%d')
            label = curr.strftime('%b %d')

        if key not in trend_dict:
            trend_dict[key] = {
                'key': key,
                'label': label,
                'expense': Decimal('0.00'),
                'income': Decimal('0.00')
            }
        curr += timedelta(days=1)

    for tx in txs:
        t_date = tx.transaction_date
        if trend_interval == 'monthly':
            k = t_date.strftime('%Y-%m')
        elif trend_interval == 'weekly':
            wk = t_date - timedelta(days=t_date.weekday())
            k = wk.strftime('%Y-%m-%d')
        else:
            k = t_date.strftime('%Y-%m-%d')

        if k in trend_dict:
            amt = Decimal(str(tx.amount))
            if tx.type == 'EXPENSE':
                trend_dict[k]['expense'] += amt
            else:
                trend_dict[k]['income'] += amt

    trend_list = []
    for k in sorted(trend_dict.keys()):
        item = trend_dict[k]
        exp = float(item['expense'])
        inc = float(item['income'])
        trend_list.append({
            'date': item['key'],
            'label': item['label'],
            'expense': exp,
            'income': inc,
            'net': inc - exp
        })

    # 2. Category Breakdown (Expenses ONLY)
    category_colors = {
        "Food & Dining": "#f97316",
        "Groceries": "#22c55e",
        "Transportation": "#06b6d4",
        "Shopping": "#ec4899",
        "Entertainment": "#a855f7",
        "Bills & Utilities": "#eab308",
        "Rent & Housing": "#3b82f6",
        "Healthcare": "#ef4444",
        "Education": "#6366f1",
        "Travel": "#14b8a6",
        "Personal Care": "#f43f5e",
        "Subscriptions": "#8b5cf6",
        "Investments": "#10b981",
        "Savings": "#34d399",
        "Salary & Income": "#10b981",
        "Other": "#94a3b8"
    }

    # Fetch custom colors if available
    user_cats = TrackerCategory.query.filter(
        or_(TrackerCategory.is_system == True, TrackerCategory.user_id == user.id)
    ).all()
    for uc in user_cats:
        if uc.color:
            category_colors[uc.name] = uc.color

    cat_map = {}
    total_expense_dec = Decimal('0.00')

    for tx in txs:
        if tx.type == 'EXPENSE':
            amt = Decimal(str(tx.amount))
            total_expense_dec += amt
            cname = tx.category_name or 'Other'
            if cname not in cat_map:
                cat_map[cname] = {'amount': Decimal('0.00'), 'count': 0}
            cat_map[cname]['amount'] += amt
            cat_map[cname]['count'] += 1

    category_breakdown = []
    for cname, info in cat_map.items():
        amt_float = float(info['amount'])
        pct = float((info['amount'] / total_expense_dec * Decimal('100')).quantize(Decimal('0.1'))) if total_expense_dec > 0 else 0.0
        category_breakdown.append({
            'name': cname,
            'amount': amt_float,
            'percentage': pct,
            'count': info['count'],
            'color': category_colors.get(cname, '#94a3b8')
        })

    category_breakdown.sort(key=lambda x: x['amount'], reverse=True)

    # 3. Spending by Merchant (Ranked horizontal bar chart)
    merchant_map = {}
    for tx in txs:
        if tx.type == 'EXPENSE':
            m = (tx.merchant or '').strip()
            if not m:
                m = 'Unspecified Merchant'
            amt = Decimal(str(tx.amount))
            if m not in merchant_map:
                merchant_map[m] = {'amount': Decimal('0.00'), 'count': 0}
            merchant_map[m]['amount'] += amt
            merchant_map[m]['count'] += 1

    merchants_list = []
    for mname, info in merchant_map.items():
        amt_float = float(info['amount'])
        pct = float((info['amount'] / total_expense_dec * Decimal('100')).quantize(Decimal('0.1'))) if total_expense_dec > 0 else 0.0
        merchants_list.append({
            'merchant': mname,
            'amount': amt_float,
            'percentage': pct,
            'count': info['count']
        })

    merchants_list.sort(key=lambda x: x['amount'], reverse=True)
    top_merchants = merchants_list[:10]

    # 4. Budget vs Actual Spending for the month of end_date
    current_month_str = end_date.strftime('%Y-%m')
    budgets = CategoryBudget.query.filter_by(user_id=user.id, month=current_month_str).all()

    # Calculate actual spending for that specific calendar month
    m_start = end_date.replace(day=1)
    next_month = (m_start.replace(day=28) + timedelta(days=4)).replace(day=1)
    m_end = next_month - timedelta(days=1)

    month_txs = TrackerTransaction.query.filter(
        TrackerTransaction.user_id == user.id,
        TrackerTransaction.type == 'EXPENSE',
        TrackerTransaction.transaction_date >= m_start,
        TrackerTransaction.transaction_date <= m_end
    ).all()

    month_cat_spend = {}
    for tx in month_txs:
        c = tx.category_name or 'Other'
        month_cat_spend[c] = month_cat_spend.get(c, Decimal('0.00')) + Decimal(str(tx.amount))

    budget_analytics = []
    for b in budgets:
        b_amt = Decimal(str(b.budget_amount))
        actual = month_cat_spend.get(b.category_name, Decimal('0.00'))
        remaining = max(Decimal('0.00'), b_amt - actual)
        overspent = max(Decimal('0.00'), actual - b_amt)
        pct = float((actual / b_amt * Decimal('100')).quantize(Decimal('0.1'))) if b_amt > 0 else 0.0

        budget_analytics.append({
            'id': b.id,
            'category_name': b.category_name,
            'month': b.month,
            'budget_amount': float(b_amt),
            'actual_spent': float(actual),
            'remaining_amount': float(remaining),
            'overspent_amount': float(overspent),
            'percentage': pct,
            'is_overspent': overspent > 0
        })

    budget_analytics.sort(key=lambda x: x['percentage'], reverse=True)

    return jsonify({
        'trend': trend_list,
        'category_breakdown': category_breakdown,
        'merchants': top_merchants,
        'budgets': budget_analytics
    }), 200


# =============================================================================
# Subscriptions CRUD
# =============================================================================

@tracker_bp.route('/subscriptions', methods=['GET'])
@jwt_required()
def get_subscriptions():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    subs = TrackerSubscription.query.filter_by(user_id=user.id).order_by(
        TrackerSubscription.status.asc(),
        TrackerSubscription.amount.desc()
    ).all()

    total_monthly = Decimal('0.00')
    for s in subs:
        if s.status == 'ACTIVE':
            amt = Decimal(str(s.amount))
            if s.billing_cycle == 'YEARLY':
                total_monthly += (amt / Decimal('12.0')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            elif s.billing_cycle == 'QUARTERLY':
                total_monthly += (amt / Decimal('3.0')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            elif s.billing_cycle == 'WEEKLY':
                total_monthly += (amt * Decimal('4.333')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            else:
                total_monthly += amt

    return jsonify({
        'subscriptions': [s.to_dict() for s in subs],
        'total_monthly_cost': float(total_monthly)
    }), 200


@tracker_bp.route('/subscriptions', methods=['POST'])
@jwt_required()
def create_subscription():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({'error': 'Subscription name is required'}), 400

    try:
        amount = Decimal(str(data.get('amount'))).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        if amount <= 0:
            return jsonify({'error': 'Amount must be greater than zero'}), 400
    except Exception:
        return jsonify({'error': 'Invalid amount'}), 400

    category_name = data.get('category_name', 'Subscriptions')
    billing_cycle = (data.get('billing_cycle') or 'MONTHLY').upper()
    next_renewal = parse_date(data.get('next_renewal_date'))
    status = (data.get('status') or 'ACTIVE').upper()
    notes = (data.get('notes') or '').strip()

    sub = TrackerSubscription(
        user_id=user.id,
        name=name,
        category_name=category_name,
        amount=amount,
        billing_cycle=billing_cycle,
        next_renewal_date=next_renewal,
        status=status,
        notes=notes
    )
    db.session.add(sub)
    db.session.commit()

    return jsonify({'subscription': sub.to_dict()}), 201


@tracker_bp.route('/subscriptions/<int:sub_id>', methods=['PUT'])
@jwt_required()
def update_subscription(sub_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    sub = TrackerSubscription.query.filter_by(id=sub_id, user_id=user.id).first()
    if not sub:
        return jsonify({'error': 'Subscription not found'}), 404

    data = request.get_json() or {}
    if 'name' in data and str(data['name']).strip():
        sub.name = str(data['name']).strip()

    if 'amount' in data:
        try:
            amt = Decimal(str(data['amount'])).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            if amt > 0:
                sub.amount = amt
        except Exception:
            return jsonify({'error': 'Invalid amount'}), 400

    if 'category_name' in data:
        sub.category_name = str(data['category_name']).strip()

    if 'billing_cycle' in data:
        sub.billing_cycle = str(data['billing_cycle']).upper()

    if 'next_renewal_date' in data:
        sub.next_renewal_date = parse_date(data['next_renewal_date'])

    if 'status' in data:
        sub.status = str(data['status']).upper()

    if 'notes' in data:
        sub.notes = str(data['notes']).strip()

    db.session.commit()
    return jsonify({'subscription': sub.to_dict()}), 200


@tracker_bp.route('/subscriptions/<int:sub_id>', methods=['DELETE'])
@jwt_required()
def delete_subscription(sub_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    sub = TrackerSubscription.query.filter_by(id=sub_id, user_id=user.id).first()
    if not sub:
        return jsonify({'error': 'Subscription not found'}), 404

    db.session.delete(sub)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Subscription deleted'}), 200


# =============================================================================
# Budgets CRUD
# =============================================================================

@tracker_bp.route('/budgets', methods=['GET'])
@jwt_required()
def get_budgets():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    month = request.args.get('month', date.today().strftime('%Y-%m'))
    budgets = CategoryBudget.query.filter_by(user_id=user.id, month=month).all()

    return jsonify({'budgets': [b.to_dict() for b in budgets]}), 200


@tracker_bp.route('/budgets', methods=['POST'])
@jwt_required()
def set_budget():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    category_name = (data.get('category_name') or '').strip()
    month = (data.get('month') or date.today().strftime('%Y-%m')).strip()

    if not category_name:
        return jsonify({'error': 'Category name is required'}), 400

    try:
        amount = Decimal(str(data.get('budget_amount'))).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        if amount <= 0:
            return jsonify({'error': 'Budget amount must be greater than zero'}), 400
    except Exception:
        return jsonify({'error': 'Invalid budget amount'}), 400

    existing = CategoryBudget.query.filter_by(
        user_id=user.id,
        category_name=category_name,
        month=month
    ).first()

    if existing:
        existing.budget_amount = amount
        db.session.commit()
        return jsonify({'budget': existing.to_dict()}), 200
    else:
        new_b = CategoryBudget(
            user_id=user.id,
            category_name=category_name,
            month=month,
            budget_amount=amount
        )
        db.session.add(new_b)
        db.session.commit()
        return jsonify({'budget': new_b.to_dict()}), 201


@tracker_bp.route('/budgets/<int:b_id>', methods=['DELETE'])
@jwt_required()
def delete_budget(b_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    b = CategoryBudget.query.filter_by(id=b_id, user_id=user.id).first()
    if not b:
        return jsonify({'error': 'Budget not found'}), 404

    db.session.delete(b)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Budget removed'}), 200


# =============================================================================
# Bill Upload & Confirmation Pipeline
# =============================================================================

@tracker_bp.route('/bills/upload', methods=['POST'])
@jwt_required()
def upload_bill():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded in form data'}), 400

    file = request.files['file']
    is_valid, err_msg, ext, mime = validate_file(file)
    if not is_valid:
        return jsonify({'error': err_msg}), 400

    file_bytes = file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        return jsonify({'error': 'File exceeds maximum allowed size of 10 MB'}), 400

    # 1. Compute file hash
    file_hash = compute_file_hash(file_bytes)

    # 2. Securely store file
    stored_filename, _ = save_bill_file(user.id, file.filename, file_bytes, ext)

    # 3. Process document extraction
    extracted = process_bill_document(file_bytes, file.filename, mime, ext)

    # 4. Duplicate detection
    is_duplicate, duplicate_reason, match_info = check_for_duplicate(
        user_id=user.id,
        file_hash=file_hash,
        merchant=extracted.get('merchant', ''),
        date_str=extracted.get('date', ''),
        amount=extracted.get('amount', 0.0),
        invoice_number=extracted.get('invoice_number', '')
    )

    # 5. Persist BillUpload record in PENDING / EXTRACTED status
    upload_rec = BillUpload(
        user_id=user.id,
        original_filename=file.filename,
        stored_filename=stored_filename,
        file_size=len(file_bytes),
        mime_type=mime,
        file_hash=file_hash,
        status='EXTRACTED',
        extracted_data=json.dumps(extracted)
    )
    db.session.add(upload_rec)
    db.session.commit()

    return jsonify({
        'upload_id': upload_rec.id,
        'original_filename': file.filename,
        'extracted_data': extracted,
        'duplicate_warning': {
            'is_duplicate': is_duplicate,
            'reason': duplicate_reason,
            'match_info': match_info
        }
    }), 200


@tracker_bp.route('/bills/<int:upload_id>/file', methods=['GET'])
def get_bill_file(upload_id):
    # Support token in Authorization header OR query param ?token=...
    token = None
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ', 1)[1]
    elif request.args.get('token'):
        token = request.args.get('token')

    if not token:
        return jsonify({'error': 'Missing authentication token'}), 401

    try:
        from flask_jwt_extended import decode_token
        decoded = decode_token(token)
        user_id = int(decoded['sub'])
    except Exception:
        return jsonify({'error': 'Invalid or expired token'}), 401

    upload = BillUpload.query.filter_by(id=upload_id, user_id=user_id).first()
    if not upload:
        return jsonify({'error': 'Bill upload not found or access denied'}), 404

    upload_dir = get_upload_dir(user_id)
    file_path = os.path.join(upload_dir, upload.stored_filename)

    if not os.path.isfile(file_path):
        return jsonify({'error': 'Stored file not found on disk'}), 404

    return send_file(
        file_path,
        mimetype=upload.mime_type,
        as_attachment=False,
        download_name=upload.original_filename
    )


@tracker_bp.route('/bills/<int:upload_id>/confirm', methods=['POST'])
@jwt_required()
def confirm_bill(upload_id):
    """
    Step 6 & 7: User reviews, corrects, and confirms extracted data.
    Only then is the transaction finalized and committed to the database!
    """
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    upload = BillUpload.query.filter_by(id=upload_id, user_id=user.id).first()
    if not upload:
        return jsonify({'error': 'Bill upload not found or access denied'}), 404

    data = request.get_json() or {}

    raw_amount = data.get('amount')
    try:
        amount = Decimal(str(raw_amount)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        if amount <= 0:
            return jsonify({'error': 'Amount must be greater than zero'}), 400
    except Exception:
        return jsonify({'error': 'Invalid amount value'}), 400

    category_name = (data.get('category_name') or 'Bills & Utilities').strip()
    merchant = (data.get('merchant') or '').strip()
    tx_date = parse_date(data.get('transaction_date'), date.today())
    payment_method = (data.get('payment_method') or 'UPI').strip()
    description = (data.get('description') or f"Bill payment: {upload.original_filename}").strip()
    tags = data.get('tags', 'bill,receipt')
    tags_str = ','.join(tags) if isinstance(tags, list) else str(tags)

    # Create the verified transaction
    tx = TrackerTransaction(
        user_id=user.id,
        type='EXPENSE',
        amount=amount,
        currency='INR',
        category_name=category_name,
        merchant=merchant,
        transaction_date=tx_date,
        payment_method=payment_method,
        description=description,
        tags=tags_str,
        receipt_filename=upload.original_filename,
        bill_upload_id=upload.id,
        is_subscription=bool(data.get('is_subscription', False))
    )

    upload.status = 'CONFIRMED'
    db.session.add(tx)
    db.session.commit()

    return jsonify({
        'message': 'Transaction confirmed and saved successfully',
        'transaction': tx.to_dict()
    }), 201


# =============================================================================
# Nickel AI Tracker Spending Insights
# =============================================================================

@tracker_bp.route('/ai/insights', methods=['POST'])
@jwt_required()
def get_ai_insights():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    start_date = parse_date(data.get('start_date'), date.today().replace(day=1))
    end_date = parse_date(data.get('end_date'), date.today())
    custom_question = (data.get('question') or '').strip()

    # Aggregate spending metrics
    txs = TrackerTransaction.query.filter(
        TrackerTransaction.user_id == user.id,
        TrackerTransaction.transaction_date >= start_date,
        TrackerTransaction.transaction_date <= end_date
    ).all()

    total_expense = sum(float(t.amount) for t in txs if t.type == 'EXPENSE')
    total_income = sum(float(t.amount) for t in txs if t.type == 'INCOME')

    cat_spend = {}
    merchant_spend = {}
    for t in txs:
        if t.type == 'EXPENSE':
            cat_spend[t.category_name] = cat_spend.get(t.category_name, 0.0) + float(t.amount)
            m = t.merchant or 'Other'
            merchant_spend[m] = merchant_spend.get(m, 0.0) + float(t.amount)

    top_cats = sorted(cat_spend.items(), key=lambda x: x[1], reverse=True)[:5]
    top_merchants = sorted(merchant_spend.items(), key=lambda x: x[1], reverse=True)[:5]

    days = max(1, (end_date - start_date).days + 1)
    daily_avg = total_expense / days

    # Subscriptions
    subs = TrackerSubscription.query.filter_by(user_id=user.id, status='ACTIVE').all()
    sub_count = len(subs)
    monthly_sub_cost = sum(float(s.amount) for s in subs)

    # Build prompt with aggregated privacy-safe financial metrics (no secrets or account PII)
    prompt_context = (
        f"User Period: {start_date} to {end_date} ({days} days)\n"
        f"- Total Expense: ₹{total_expense:,.2f}\n"
        f"- Total Income: ₹{total_income:,.2f}\n"
        f"- Net Savings/Deficit: ₹{(total_income - total_expense):,.2f}\n"
        f"- Daily Average Spending: ₹{daily_avg:,.2f}/day\n"
        f"- Top Expense Categories: {', '.join([f'{c[0]}: ₹{c[1]:,.2f}' for c in top_cats]) if top_cats else 'None'}\n"
        f"- Top Merchants: {', '.join([f'{m[0]}: ₹{m[1]:,.2f}' for m in top_merchants]) if top_merchants else 'None'}\n"
        f"- Active Subscriptions: {sub_count} totaling ₹{monthly_sub_cost:,.2f}/month\n"
    )

    api_key = os.environ.get('GEMINI_API_KEY')
    ai_response = None

    if api_key and api_key != 'your_google_gemini_api_key_here':
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=api_key)

            user_query = custom_question if custom_question else "Provide an analysis of my spending patterns with 3 specific, actionable recommendations to optimize my money."

            system_instruction = (
                "You are Nickel AI, an encouraging and insightful financial advisor for the Nickel platform. "
                "Analyze the user's spending data for the given period. "
                "Highlight key observations (e.g. major expense drivers, recurring costs) and give 3 crisp, concrete tips to cut unnecessary spending and boost savings. "
                "Keep your response concise, motivating, and formatted in clean markdown bullet points. Use INR (₹) formatting."
            )

            prompt = f"{prompt_context}\n\nUser Question/Request:\n{user_query}"

            preferred_model = os.environ.get('GEMINI_MODEL', 'gemini-2.5-flash')
            candidate_models = [preferred_model, 'gemini-flash-latest', 'gemini-2.0-flash']
            seen = set()
            models = [m for m in candidate_models if not (m in seen or seen.add(m))]

            for m in models:
                try:
                    resp = client.models.generate_content(
                        model=m,
                        contents=prompt,
                        config=types.GenerateContentConfig(system_instruction=system_instruction)
                    )
                    if resp and resp.text:
                        ai_response = resp.text.strip()
                        break
                except Exception as e:
                    logger.warning(f"Gemini insight error with {m}: {e}")
        except Exception as e:
            logger.warning(f"Gemini insight generation failed: {e}")

    # High-quality fallback if Gemini is offline
    if not ai_response:
        highlights = []
        if total_expense == 0:
            ai_response = "You don't have any recorded expenses for this period yet! Start tracking your daily purchases or upload a bill to unlock personalized AI insights."
        else:
            if top_cats:
                biggest_cat, cat_amt = top_cats[0]
                pct = (cat_amt / total_expense * 100) if total_expense > 0 else 0
                highlights.append(f"**{biggest_cat}** represents your largest expense at ₹{cat_amt:,.2f} ({pct:.1f}% of total spend).")

            if top_merchants:
                biggest_m, m_amt = top_merchants[0]
                highlights.append(f"Your highest spend merchant was **{biggest_m}** (₹{m_amt:,.2f}).")

            if monthly_sub_cost > 0:
                highlights.append(f"You have **{sub_count} active subscriptions** costing ₹{monthly_sub_cost:,.2f}/month. Consider reviewing any unused services.")

            tips = [
                f"Setting a category budget for **{top_cats[0][0] if top_cats else 'your top category'}** can prevent monthly budget creep.",
                "Review daily miscellaneous purchases that can be routed toward your Nickel savings goals instead.",
                "Upload recent utility and grocery bills to automatically track price shifts over time."
            ]

            ai_response = "### Spending Summary\n" + "\n".join([f"- {h}" for h in highlights]) + "\n\n### Actionable Suggestions\n" + "\n".join([f"1. {t}" for t in tips])

    return jsonify({
        'analysis': ai_response,
        'metrics_analyzed': {
            'total_expense': total_expense,
            'total_income': total_income,
            'daily_average': round(daily_avg, 2),
            'top_category': top_cats[0][0] if top_cats else None,
            'period_days': days
        }
    }), 200
