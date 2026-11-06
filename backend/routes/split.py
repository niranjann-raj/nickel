import re
import secrets
from datetime import datetime, date, timezone
from decimal import Decimal
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import desc, or_, and_

from models import (
    db, User, SplitRoom, SplitMember, SplitExpense,
    SplitExpensePayer, SplitExpenseShare,
    SplitSettlementPayment, SplitActivity
)
from services.split_calculator import (
    to_decimal, calculate_shares, compute_room_financials,
    DECIMAL_ZERO
)

split_bp = Blueprint('split', __name__)

CATEGORY_COLORS = {
    'Accommodation': '#8B5CF6',
    'Food & Drinks': '#F59E0B',
    'Transport': '#3B82F6',
    'Fuel': '#EF4444',
    'Shopping': '#EC4899',
    'Activities & Tickets': '#10B981',
    'Groceries': '#14B8A6',
    'Bills': '#6366F1',
    'Other': '#6B7280',
}


def get_current_user():
    user_id = get_jwt_identity()
    if user_id is None:
        return None
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        pass
    return User.query.get(user_id)


def generate_unique_room_code() -> str:
    """Generate a cryptographically secure 6-character hexadecimal room code (0-9, A-F)."""
    for _ in range(20):
        code = secrets.token_hex(3).upper()  # 3 bytes = 6 hex characters
        if not SplitRoom.query.filter_by(code=code).first():
            return code
    raise RuntimeError("Failed to generate a unique room code. Please try again.")


def get_membership(room_id: int, user_id: int):
    return SplitMember.query.filter_by(room_id=room_id, user_id=user_id).first()


# =============================================================================
# Rooms Endpoints
# =============================================================================

@split_bp.route('/rooms', methods=['GET'])
@jwt_required()
def list_rooms():
    """List all rooms the authenticated user belongs to."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    memberships = SplitMember.query.filter_by(user_id=user.id).all()
    room_ids = [m.room_id for m in memberships]

    if not room_ids:
        return jsonify({'rooms': []}), 200

    query = SplitRoom.query.filter(SplitRoom.id.in_(room_ids))

    status_filter = request.args.get('status', 'all').lower()
    if status_filter == 'active':
        query = query.filter(SplitRoom.is_settled == False)
    elif status_filter == 'settled':
        query = query.filter(SplitRoom.is_settled == True)

    rooms = query.order_by(SplitRoom.updated_at.desc()).all()

    # Enrich room cards with quick balance for current user
    results = []
    for r in rooms:
        r_dict = r.to_dict(current_user_id=user.id)
        # Compute user's net position in room
        try:
            fin = compute_room_financials(r.id)
            user_balance = next((mb for mb in fin['members_balances'] if mb['user_id'] == user.id), None)
            r_dict['user_outstanding'] = user_balance['outstanding_balance'] if user_balance else 0.0
            r_dict['user_status_label'] = user_balance['status_label'] if user_balance else 'Settled'
            r_dict['user_status_type'] = user_balance['status_type'] if user_balance else 'SETTLED'
            r_dict['settlement_progress'] = fin['settlement_progress_percentage']
            r_dict['is_fully_settled'] = fin['is_fully_settled']
        except Exception:
            r_dict['user_outstanding'] = 0.0
            r_dict['user_status_label'] = 'Settled'
            r_dict['user_status_type'] = 'SETTLED'
            r_dict['settlement_progress'] = 100.0 if r.is_settled else 0.0
            r_dict['is_fully_settled'] = r.is_settled

        results.append(r_dict)

    return jsonify({'rooms': results}), 200


@split_bp.route('/rooms', methods=['POST'])
@jwt_required()
def create_room():
    """Create a new room with a secure unique 6-character hex code."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({'error': 'Room name is required'}), 400

    description = (data.get('description') or '').strip()
    currency = (data.get('currency') or 'INR').strip().upper()
    icon = (data.get('icon') or 'Users').strip()

    start_date = None
    end_date = None
    if data.get('start_date'):
        try:
            start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        except ValueError:
            pass
    if data.get('end_date'):
        try:
            end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        except ValueError:
            pass

    try:
        code = generate_unique_room_code()
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    room = SplitRoom(
        code=code,
        name=name,
        description=description if description else None,
        currency=currency,
        icon=icon,
        start_date=start_date,
        end_date=end_date,
        created_by=user.id,
        is_settled=True  # Initially empty room has 0 debt
    )
    db.session.add(room)
    db.session.flush()

    # Automatically make creator the owner
    membership = SplitMember(
        room_id=room.id,
        user_id=user.id,
        role='owner'
    )
    db.session.add(membership)

    # Activity log
    activity = SplitActivity(
        room_id=room.id,
        user_id=user.id,
        activity_type='ROOM_CREATED',
        description=f"{user.full_name} created the room '{name}'"
    )
    db.session.add(activity)

    db.session.commit()

    return jsonify({
        'message': 'Room created successfully',
        'room': room.to_dict(current_user_id=user.id)
    }), 201


@split_bp.route('/rooms/join', methods=['POST'])
@jwt_required()
def join_room():
    """Join a room using its 6-character hexadecimal code."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    raw_code = (data.get('code') or '').strip().upper()

    if not raw_code:
        return jsonify({'error': 'Room code is required'}), 400

    if not re.match(r'^[0-9A-F]{6}$', raw_code):
        return jsonify({'error': 'Invalid room code. Code must be exactly 6 hexadecimal characters (0-9, A-F)'}), 400

    room = SplitRoom.query.filter_by(code=raw_code).first()
    if not room:
        return jsonify({'error': 'No room found with this code. Please check and try again.'}), 404

    # Check if already a member
    existing = SplitMember.query.filter_by(room_id=room.id, user_id=user.id).first()
    if existing:
        return jsonify({
            'message': 'You are already a member of this room',
            'room': room.to_dict(current_user_id=user.id),
            'already_member': True
        }), 200

    # Add as member
    new_member = SplitMember(
        room_id=room.id,
        user_id=user.id,
        role='member'
    )
    db.session.add(new_member)

    # Activity
    activity = SplitActivity(
        room_id=room.id,
        user_id=user.id,
        activity_type='MEMBER_JOINED',
        description=f"{user.full_name} joined the room"
    )
    db.session.add(activity)

    db.session.commit()

    return jsonify({
        'message': f"Joined '{room.name}' successfully",
        'room': room.to_dict(current_user_id=user.id),
        'already_member': False
    }), 200


@split_bp.route('/rooms/<int:room_id>', methods=['GET'])
@jwt_required()
def get_room(room_id: int):
    """Get full details of a specific room."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    membership = get_membership(room_id, user.id)
    if not membership:
        return jsonify({'error': 'Access denied. You are not a member of this room.'}), 403

    room = SplitRoom.query.get(room_id)
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    fin = compute_room_financials(room_id)
    members = [m.to_dict() for m in room.members]

    return jsonify({
        'room': room.to_dict(current_user_id=user.id),
        'members': members,
        'financials': fin
    }), 200


@split_bp.route('/rooms/<int:room_id>', methods=['PUT'])
@jwt_required()
def update_room(room_id: int):
    """Update room details (owner only)."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    membership = get_membership(room_id, user.id)
    if not membership or membership.role != 'owner':
        return jsonify({'error': 'Only the room owner can modify room settings'}), 403

    room = SplitRoom.query.get(room_id)
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    data = request.get_json() or {}
    if 'name' in data and data['name'].strip():
        room.name = data['name'].strip()
    if 'description' in data:
        room.description = data['description'].strip() if data['description'] else None
    if 'icon' in data:
        room.icon = data['icon'].strip()
    if 'start_date' in data:
        try:
            room.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date() if data['start_date'] else None
        except ValueError:
            pass
    if 'end_date' in data:
        try:
            room.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date() if data['end_date'] else None
        except ValueError:
            pass

    room.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify({
        'message': 'Room updated successfully',
        'room': room.to_dict(current_user_id=user.id)
    }), 200


@split_bp.route('/rooms/<int:room_id>', methods=['DELETE'])
@jwt_required()
def delete_room(room_id: int):
    """Delete room (owner only)."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    membership = get_membership(room_id, user.id)
    if not membership or membership.role != 'owner':
        return jsonify({'error': 'Only the room owner can delete this room'}), 403

    room = SplitRoom.query.get(room_id)
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    db.session.delete(room)
    db.session.commit()

    return jsonify({'message': 'Room deleted successfully'}), 200


@split_bp.route('/rooms/<int:room_id>/leave', methods=['POST'])
@jwt_required()
def leave_room(room_id: int):
    """Leave a room if user has zero balance and is not sole owner."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    membership = get_membership(room_id, user.id)
    if not membership:
        return jsonify({'error': 'You are not a member of this room'}), 400

    room = SplitRoom.query.get(room_id)
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    # Check outstanding balance
    fin = compute_room_financials(room_id)
    user_bal = next((mb for mb in fin['members_balances'] if mb['user_id'] == user.id), None)
    if user_bal and abs(user_bal['outstanding_balance']) > 0.005:
        bal_str = f"₹{abs(user_bal['outstanding_balance']):,.2f}"
        if user_bal['outstanding_balance'] < 0:
            return jsonify({'error': f"Cannot leave room: you have an outstanding debt of {bal_str}. Settle debts first."}), 400
        else:
            return jsonify({'error': f"Cannot leave room: you are owed {bal_str}. Collect settlements first."}), 400

    # If user is owner and there are other members
    if membership.role == 'owner' and len(room.members) > 1:
        # Transfer ownership to next oldest member
        next_member = next((m for m in room.members if m.user_id != user.id), None)
        if next_member:
            next_member.role = 'owner'

    db.session.delete(membership)

    activity = SplitActivity(
        room_id=room.id,
        user_id=user.id,
        activity_type='MEMBER_LEFT',
        description=f"{user.full_name} left the room"
    )
    db.session.add(activity)

    db.session.commit()
    return jsonify({'message': 'You have left the room'}), 200


# =============================================================================
# Members Endpoints
# =============================================================================

@split_bp.route('/rooms/<int:room_id>/members', methods=['GET'])
@jwt_required()
def get_room_members(room_id: int):
    """List members and their financial breakdown in room."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if not get_membership(room_id, user.id):
        return jsonify({'error': 'Access denied'}), 403

    fin = compute_room_financials(room_id)
    return jsonify({'members': fin['members_balances']}), 200


@split_bp.route('/rooms/<int:room_id>/members/<int:target_user_id>', methods=['DELETE'])
@jwt_required()
def remove_room_member(room_id: int, target_user_id: int):
    """Remove a member from the room (owner only, must have 0 balance)."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    membership = get_membership(room_id, user.id)
    if not membership or membership.role != 'owner':
        return jsonify({'error': 'Only the room owner can remove members'}), 403

    target_membership = get_membership(room_id, target_user_id)
    if not target_membership:
        return jsonify({'error': 'Member not found in this room'}), 404

    fin = compute_room_financials(room_id)
    target_bal = next((mb for mb in fin['members_balances'] if mb['user_id'] == target_user_id), None)
    if target_bal and abs(target_bal['outstanding_balance']) > 0.005:
        return jsonify({
            'error': f"Cannot remove member: {target_bal['user_name']} has an unsettled balance of ₹{abs(target_bal['outstanding_balance']):,.2f}."
        }), 400

    target_name = target_membership.user.full_name if target_membership.user else f"User #{target_user_id}"
    db.session.delete(target_membership)

    activity = SplitActivity(
        room_id=room_id,
        user_id=user.id,
        activity_type='MEMBER_REMOVED',
        description=f"{user.full_name} removed {target_name} from the room"
    )
    db.session.add(activity)

    db.session.commit()
    return jsonify({'message': f"Member {target_name} removed successfully"}), 200


# =============================================================================
# Expenses Endpoints
# =============================================================================

@split_bp.route('/rooms/<int:room_id>/expenses', methods=['GET'])
@jwt_required()
def list_expenses(room_id: int):
    """List expenses with search, category filter, payer filter, and sorting."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if not get_membership(room_id, user.id):
        return jsonify({'error': 'Access denied'}), 403

    query = SplitExpense.query.filter_by(room_id=room_id, is_deleted=False)

    # Search by title
    search = request.args.get('search', '').strip()
    if search:
        query = query.filter(SplitExpense.title.ilike(f'%{search}%'))

    # Category filter
    category = request.args.get('category', '').strip()
    if category and category != 'All':
        query = query.filter(SplitExpense.category == category)

    # Payer filter
    payer_id = request.args.get('payer_id')
    if payer_id and payer_id.isdigit():
        p_uid = int(payer_id)
        query = query.filter(SplitExpense.payers.any(SplitExpensePayer.user_id == p_uid))

    # Date range
    start_date = request.args.get('start_date')
    if start_date:
        try:
            sd = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(SplitExpense.expense_date >= sd)
        except ValueError:
            pass

    end_date = request.args.get('end_date')
    if end_date:
        try:
            ed = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(SplitExpense.expense_date <= ed)
        except ValueError:
            pass

    # Sort
    sort_by = request.args.get('sort_by', 'newest')
    if sort_by == 'oldest':
        query = query.order_by(SplitExpense.expense_date.asc(), SplitExpense.id.asc())
    elif sort_by == 'amount_desc':
        query = query.order_by(SplitExpense.amount.desc())
    elif sort_by == 'amount_asc':
        query = query.order_by(SplitExpense.amount.asc())
    else:  # newest
        query = query.order_by(SplitExpense.expense_date.desc(), SplitExpense.id.desc())

    expenses = query.all()
    return jsonify({'expenses': [e.to_dict() for e in expenses]}), 200


@split_bp.route('/rooms/<int:room_id>/expenses', methods=['POST'])
@jwt_required()
def add_expense(room_id: int):
    """Add a shared expense with flexible payer(s) and split method."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    membership = get_membership(room_id, user.id)
    if not membership:
        return jsonify({'error': 'Access denied'}), 403

    data = request.get_json() or {}

    title = (data.get('title') or '').strip()
    if not title:
        return jsonify({'error': 'Expense title is required'}), 400

    try:
        total_amount = to_decimal(data.get('amount'))
        if total_amount <= Decimal('0.00'):
            return jsonify({'error': 'Amount must be greater than zero'}), 400
    except Exception:
        return jsonify({'error': 'Invalid expense amount'}), 400

    category = (data.get('category') or 'Other').strip()
    split_method = (data.get('split_method') or 'EQUAL').strip().upper()
    notes = (data.get('notes') or '').strip()

    expense_date = date.today()
    if data.get('expense_date'):
        try:
            expense_date = datetime.strptime(data['expense_date'], '%Y-%m-%d').date()
        except ValueError:
            pass

    # Verify all room members
    room_members = SplitMember.query.filter_by(room_id=room_id).all()
    valid_member_ids = {m.user_id for m in room_members}

    # 1. Process Payers
    payers_data = data.get('payers')
    if not payers_data or not isinstance(payers_data, list):
        # Default: current user paid full amount
        payers_data = [{'user_id': user.id, 'amount_paid': total_amount}]

    processed_payers = []
    payer_sum = Decimal('0.00')
    for p in payers_data:
        p_uid = p.get('user_id')
        if p_uid not in valid_member_ids:
            return jsonify({'error': f"Payer user ID {p_uid} is not a member of this room"}), 400
        p_amt = to_decimal(p.get('amount_paid'))
        if p_amt < Decimal('0.00'):
            return jsonify({'error': 'Payer amount cannot be negative'}), 400
        payer_sum += p_amt
        processed_payers.append({'user_id': p_uid, 'amount_paid': p_amt})

    if abs(payer_sum - total_amount) > Decimal('0.01'):
        return jsonify({
            'error': f"Total paid by payers (₹{payer_sum:.2f}) does not match expense amount (₹{total_amount:.2f})."
        }), 400

    # 2. Process Participants & Shares
    participants_data = data.get('participants')
    if not participants_data or not isinstance(participants_data, list):
        # Default: all room members split equally
        participants_data = [{'user_id': m.user_id} for m in room_members]

    for p in participants_data:
        if p.get('user_id') not in valid_member_ids:
            return jsonify({'error': f"Participant user ID {p.get('user_id')} is not a room member"}), 400

    try:
        calculated_shares = calculate_shares(total_amount, split_method, participants_data)
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400

    # 3. Save to database in a single atomic transaction
    try:
        expense = SplitExpense(
            room_id=room_id,
            created_by=user.id,
            title=title,
            amount=total_amount,
            category=category,
            expense_date=expense_date,
            notes=notes if notes else None,
            split_method=split_method
        )
        db.session.add(expense)
        db.session.flush()

        for pp in processed_payers:
            payer_entry = SplitExpensePayer(
                expense_id=expense.id,
                user_id=pp['user_id'],
                amount_paid=pp['amount_paid']
            )
            db.session.add(payer_entry)

        for cs in calculated_shares:
            share_entry = SplitExpenseShare(
                expense_id=expense.id,
                user_id=cs['user_id'],
                share_amount=cs['share_amount'],
                raw_value=cs.get('raw_value')
            )
            db.session.add(share_entry)

        activity = SplitActivity(
            room_id=room_id,
            user_id=user.id,
            activity_type='EXPENSE_ADDED',
            description=f"{user.full_name} added expense '{title}' for ₹{total_amount:,.2f}"
        )
        db.session.add(activity)

        # Mark room as active / updated
        room = SplitRoom.query.get(room_id)
        room.updated_at = datetime.now(timezone.utc)

        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f"Failed to record expense: {str(e)}"}), 500

    return jsonify({
        'message': 'Expense recorded successfully',
        'expense': expense.to_dict()
    }), 201


@split_bp.route('/rooms/<int:room_id>/expenses/<int:expense_id>', methods=['GET'])
@jwt_required()
def get_expense(room_id: int, expense_id: int):
    """Get single expense details with full transparent breakdown."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if not get_membership(room_id, user.id):
        return jsonify({'error': 'Access denied'}), 403

    expense = SplitExpense.query.filter_by(id=expense_id, room_id=room_id, is_deleted=False).first()
    if not expense:
        return jsonify({'error': 'Expense not found'}), 404

    return jsonify({'expense': expense.to_dict()}), 200


@split_bp.route('/rooms/<int:room_id>/expenses/<int:expense_id>', methods=['PUT'])
@jwt_required()
def update_expense(room_id: int, expense_id: int):
    """Update expense (creator or room owner only)."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    membership = get_membership(room_id, user.id)
    if not membership:
        return jsonify({'error': 'Access denied'}), 403

    expense = SplitExpense.query.filter_by(id=expense_id, room_id=room_id, is_deleted=False).first()
    if not expense:
        return jsonify({'error': 'Expense not found'}), 404

    if expense.created_by != user.id and membership.role != 'owner':
        return jsonify({'error': 'Only the expense creator or room owner can edit this expense'}), 403

    data = request.get_json() or {}

    title = (data.get('title') or expense.title).strip()
    try:
        total_amount = to_decimal(data.get('amount')) if 'amount' in data else to_decimal(expense.amount)
        if total_amount <= Decimal('0.00'):
            return jsonify({'error': 'Amount must be greater than zero'}), 400
    except Exception:
        return jsonify({'error': 'Invalid expense amount'}), 400

    category = (data.get('category') or expense.category).strip()
    split_method = (data.get('split_method') or expense.split_method).strip().upper()
    notes = data.get('notes', expense.notes)

    expense_date = expense.expense_date
    if data.get('expense_date'):
        try:
            expense_date = datetime.strptime(data['expense_date'], '%Y-%m-%d').date()
        except ValueError:
            pass

    room_members = SplitMember.query.filter_by(room_id=room_id).all()
    valid_member_ids = {m.user_id for m in room_members}

    # Process Payers
    payers_data = data.get('payers')
    if not payers_data or not isinstance(payers_data, list):
        payers_data = [{'user_id': user.id, 'amount_paid': total_amount}]

    processed_payers = []
    payer_sum = Decimal('0.00')
    for p in payers_data:
        p_uid = p.get('user_id')
        if p_uid not in valid_member_ids:
            return jsonify({'error': f"Payer user ID {p_uid} is not a member of this room"}), 400
        p_amt = to_decimal(p.get('amount_paid'))
        if p_amt < Decimal('0.00'):
            return jsonify({'error': 'Payer amount cannot be negative'}), 400
        payer_sum += p_amt
        processed_payers.append({'user_id': p_uid, 'amount_paid': p_amt})

    if abs(payer_sum - total_amount) > Decimal('0.01'):
        return jsonify({
            'error': f"Total paid by payers (₹{payer_sum:.2f}) does not match expense amount (₹{total_amount:.2f})."
        }), 400

    # Process Participants & Shares
    participants_data = data.get('participants')
    if not participants_data or not isinstance(participants_data, list):
        participants_data = [{'user_id': m.user_id} for m in room_members]

    try:
        calculated_shares = calculate_shares(total_amount, split_method, participants_data)
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400

    try:
        expense.title = title
        expense.amount = total_amount
        expense.category = category
        expense.split_method = split_method
        expense.expense_date = expense_date
        expense.notes = notes.strip() if notes else None
        expense.updated_at = datetime.now(timezone.utc)

        # Replace payers
        SplitExpensePayer.query.filter_by(expense_id=expense.id).delete()
        for pp in processed_payers:
            db.session.add(SplitExpensePayer(
                expense_id=expense.id,
                user_id=pp['user_id'],
                amount_paid=pp['amount_paid']
            ))

        # Replace shares
        SplitExpenseShare.query.filter_by(expense_id=expense.id).delete()
        for cs in calculated_shares:
            db.session.add(SplitExpenseShare(
                expense_id=expense.id,
                user_id=cs['user_id'],
                share_amount=cs['share_amount'],
                raw_value=cs.get('raw_value')
            ))

        activity = SplitActivity(
            room_id=room_id,
            user_id=user.id,
            activity_type='EXPENSE_UPDATED',
            description=f"{user.full_name} updated expense '{title}'"
        )
        db.session.add(activity)

        room = SplitRoom.query.get(room_id)
        room.updated_at = datetime.now(timezone.utc)

        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f"Failed to update expense: {str(e)}"}), 500

    return jsonify({
        'message': 'Expense updated successfully',
        'expense': expense.to_dict()
    }), 200


@split_bp.route('/rooms/<int:room_id>/expenses/<int:expense_id>', methods=['DELETE'])
@jwt_required()
def delete_expense(room_id: int, expense_id: int):
    """Soft delete an expense (creator or room owner only)."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    membership = get_membership(room_id, user.id)
    if not membership:
        return jsonify({'error': 'Access denied'}), 403

    expense = SplitExpense.query.filter_by(id=expense_id, room_id=room_id, is_deleted=False).first()
    if not expense:
        return jsonify({'error': 'Expense not found'}), 404

    if expense.created_by != user.id and membership.role != 'owner':
        return jsonify({'error': 'Only the expense creator or room owner can delete this expense'}), 403

    expense.is_deleted = True
    expense.updated_at = datetime.now(timezone.utc)

    activity = SplitActivity(
        room_id=room_id,
        user_id=user.id,
        activity_type='EXPENSE_DELETED',
        description=f"{user.full_name} deleted expense '{expense.title}'"
    )
    db.session.add(activity)

    room = SplitRoom.query.get(room_id)
    room.updated_at = datetime.now(timezone.utc)

    db.session.commit()
    return jsonify({'message': 'Expense deleted successfully'}), 200


# =============================================================================
# Balances & Settlements Endpoints
# =============================================================================

@split_bp.route('/rooms/<int:room_id>/balances', methods=['GET'])
@jwt_required()
def get_room_balances(room_id: int):
    """Retrieve full balance sheet and simplified settlement suggestions."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if not get_membership(room_id, user.id):
        return jsonify({'error': 'Access denied'}), 403

    fin = compute_room_financials(room_id)
    return jsonify(fin), 200


@split_bp.route('/rooms/<int:room_id>/payments', methods=['POST'])
@jwt_required()
def record_settlement_payment(room_id: int):
    """Record a settlement payment (Reported by debtor or creator)."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    membership = get_membership(room_id, user.id)
    if not membership:
        return jsonify({'error': 'Access denied'}), 403

    data = request.get_json() or {}
    payer_id = data.get('payer_id')
    recipient_id = data.get('recipient_id')
    notes = (data.get('notes') or '').strip()

    if not payer_id or not recipient_id:
        return jsonify({'error': 'Both payer and recipient are required'}), 400

    if payer_id == recipient_id:
        return jsonify({'error': 'Payer and recipient cannot be the same user'}), 400

    # User authorization: user must be payer, recipient, or room owner
    if user.id != payer_id and user.id != recipient_id and membership.role != 'owner':
        return jsonify({'error': 'You can only record payments involving yourself'}), 403

    room_members = {m.user_id: m for m in SplitMember.query.filter_by(room_id=room_id).all()}
    if payer_id not in room_members or recipient_id not in room_members:
        return jsonify({'error': 'Both payer and recipient must be room members'}), 400

    try:
        amount = to_decimal(data.get('amount'))
        if amount <= Decimal('0.00'):
            return jsonify({'error': 'Payment amount must be greater than zero'}), 400
    except Exception:
        return jsonify({'error': 'Invalid payment amount'}), 400

    # If the recipient records it directly, it can be immediately confirmed; otherwise REPORTED
    initial_status = 'CONFIRMED' if user.id == recipient_id else 'REPORTED'
    confirmed_at = datetime.now(timezone.utc) if initial_status == 'CONFIRMED' else None

    payment = SplitSettlementPayment(
        room_id=room_id,
        payer_id=payer_id,
        recipient_id=recipient_id,
        created_by=user.id,
        amount=amount,
        status=initial_status,
        notes=notes if notes else None,
        confirmed_at=confirmed_at
    )
    db.session.add(payment)

    payer_name = room_members[payer_id].user.full_name if room_members[payer_id].user else f"User #{payer_id}"
    recipient_name = room_members[recipient_id].user.full_name if room_members[recipient_id].user else f"User #{recipient_id}"

    status_text = "confirmed" if initial_status == 'CONFIRMED' else "reported (pending confirmation)"
    activity = SplitActivity(
        room_id=room_id,
        user_id=user.id,
        activity_type='PAYMENT_REPORTED',
        description=f"{user.full_name} recorded a payment of ₹{amount:,.2f} from {payer_name} to {recipient_name} ({status_text})"
    )
    db.session.add(activity)

    room = SplitRoom.query.get(room_id)
    room.updated_at = datetime.now(timezone.utc)

    db.session.commit()

    return jsonify({
        'message': f"Payment recorded successfully as {initial_status.lower()}",
        'payment': payment.to_dict()
    }), 201


@split_bp.route('/rooms/<int:room_id>/payments/<int:payment_id>/confirm', methods=['POST'])
@jwt_required()
def confirm_settlement_payment(room_id: int, payment_id: int):
    """Recipient confirms receipt of settlement payment."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    membership = get_membership(room_id, user.id)
    if not membership:
        return jsonify({'error': 'Access denied'}), 403

    payment = SplitSettlementPayment.query.filter_by(id=payment_id, room_id=room_id).first()
    if not payment:
        return jsonify({'error': 'Payment record not found'}), 404

    # Only recipient can confirm receipt (never the sender/payer)
    if user.id != payment.recipient_id:
        return jsonify({'error': 'Only the recipient can confirm payment receipt'}), 403

    if payment.status == 'CONFIRMED':
        return jsonify({'message': 'Payment is already confirmed', 'payment': payment.to_dict()}), 200

    payment.status = 'CONFIRMED'
    payment.confirmed_at = datetime.now(timezone.utc)

    payer_user = User.query.get(payment.payer_id)
    payer_name = payer_user.full_name if payer_user else f"User #{payment.payer_id}"

    activity = SplitActivity(
        room_id=room_id,
        user_id=user.id,
        activity_type='PAYMENT_CONFIRMED',
        description=f"{user.full_name} confirmed receipt of ₹{payment.amount:,.2f} from {payer_name}"
    )
    db.session.add(activity)

    room = SplitRoom.query.get(room_id)
    room.updated_at = datetime.now(timezone.utc)

    db.session.commit()

    # Re-calculate to update room.is_settled
    compute_room_financials(room_id)

    return jsonify({
        'message': 'Payment confirmed successfully',
        'payment': payment.to_dict()
    }), 200


@split_bp.route('/rooms/<int:room_id>/payments/<int:payment_id>/dispute', methods=['POST'])
@jwt_required()
def dispute_settlement_payment(room_id: int, payment_id: int):
    """Recipient disputes reported payment."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    membership = get_membership(room_id, user.id)
    if not membership:
        return jsonify({'error': 'Access denied'}), 403

    payment = SplitSettlementPayment.query.filter_by(id=payment_id, room_id=room_id).first()
    if not payment:
        return jsonify({'error': 'Payment record not found'}), 404

    # Only recipient can dispute this payment (never the sender/payer)
    if user.id != payment.recipient_id:
        return jsonify({'error': 'Only the recipient can dispute this payment'}), 403

    payment.status = 'DISPUTED'

    activity = SplitActivity(
        room_id=room_id,
        user_id=user.id,
        activity_type='PAYMENT_DISPUTED',
        description=f"{user.full_name} disputed payment #{payment.id} of ₹{payment.amount:,.2f}"
    )
    db.session.add(activity)

    room = SplitRoom.query.get(room_id)
    room.updated_at = datetime.now(timezone.utc)

    db.session.commit()

    return jsonify({
        'message': 'Payment disputed',
        'payment': payment.to_dict()
    }), 200


@split_bp.route('/rooms/<int:room_id>/payments', methods=['GET'])
@jwt_required()
def list_settlement_payments(room_id: int):
    """List settlement payment history for room."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if not get_membership(room_id, user.id):
        return jsonify({'error': 'Access denied'}), 403

    payments = SplitSettlementPayment.query.filter_by(room_id=room_id).order_by(SplitSettlementPayment.created_at.desc()).all()
    return jsonify({'payments': [p.to_dict() for p in payments]}), 200


# =============================================================================
# Analytics Endpoints
# =============================================================================

@split_bp.route('/rooms/<int:room_id>/analytics', methods=['GET'])
@jwt_required()
def get_room_analytics(room_id: int):
    """Compute chart metrics: member spending, member shares, categories, spending over time."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if not get_membership(room_id, user.id):
        return jsonify({'error': 'Access denied'}), 403

    fin = compute_room_financials(room_id)
    expenses = SplitExpense.query.filter_by(room_id=room_id, is_deleted=False).order_by(SplitExpense.expense_date.asc()).all()

    # 1. Spending by member (amount paid)
    spending_by_member = []
    shares_by_member = []
    for mb in fin['members_balances']:
        spending_by_member.append({
            'user_id': mb['user_id'],
            'name': mb['user_name'],
            'avatar': mb['user_avatar'],
            'amount': mb['total_paid']
        })
        shares_by_member.append({
            'user_id': mb['user_id'],
            'name': mb['user_name'],
            'avatar': mb['user_avatar'],
            'share': mb['total_share']
        })

    # 2. Spending by category
    category_totals = {}
    category_counts = {}
    for exp in expenses:
        cat = exp.category or 'Other'
        amt = float(exp.amount)
        category_totals[cat] = category_totals.get(cat, 0.0) + amt
        category_counts[cat] = category_counts.get(cat, 0) + 1

    spending_by_category = []
    for cat, total in sorted(category_totals.items(), key=lambda x: x[1], reverse=True):
        spending_by_category.append({
            'category': cat,
            'amount': round(total, 2),
            'count': category_counts[cat],
            'color': CATEGORY_COLORS.get(cat, '#6B7280')
        })

    # 3. Spending over time (daily cumulative)
    daily_totals = {}
    for exp in expenses:
        d_str = exp.expense_date.isoformat()
        daily_totals[d_str] = daily_totals.get(d_str, 0.0) + float(exp.amount)

    spending_over_time = []
    cumulative = 0.0
    for d_str in sorted(daily_totals.keys()):
        amt = daily_totals[d_str]
        cumulative += amt
        spending_over_time.append({
            'date': d_str,
            'amount': round(amt, 2),
            'cumulative': round(cumulative, 2)
        })

    # 4. Settlement overview metrics
    settlement_overview = {
        'total_spent': fin['total_spent'],
        'total_settled_amount': fin['total_settled_amount'],
        'total_outstanding_debt': fin['total_outstanding_debt'],
        'settlement_progress_percentage': fin['settlement_progress_percentage'],
        'completed_payments_count': sum(1 for p in fin['payments'] if p['status'] == 'CONFIRMED'),
        'pending_payments_count': sum(1 for p in fin['payments'] if p['status'] == 'REPORTED'),
        'is_fully_settled': fin['is_fully_settled']
    }

    return jsonify({
        'spending_by_member': spending_by_member,
        'shares_by_member': shares_by_member,
        'spending_by_category': spending_by_category,
        'spending_over_time': spending_over_time,
        'settlement_overview': settlement_overview
    }), 200


# =============================================================================
# Activities Endpoints
# =============================================================================

@split_bp.route('/rooms/<int:room_id>/activities', methods=['GET'])
@jwt_required()
def get_room_activities(room_id: int):
    """Retrieve activity timeline for the room."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if not get_membership(room_id, user.id):
        return jsonify({'error': 'Access denied'}), 403

    limit = request.args.get('limit', 30)
    try:
        limit = min(100, max(1, int(limit)))
    except ValueError:
        limit = 30

    activities = SplitActivity.query.filter_by(room_id=room_id).order_by(SplitActivity.created_at.desc()).limit(limit).all()
    return jsonify({'activities': [a.to_dict() for a in activities]}), 200
