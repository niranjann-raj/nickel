from decimal import Decimal, ROUND_HALF_UP, ROUND_FLOOR
from typing import List, Dict, Any, Tuple
from datetime import datetime, timezone
import json

from models import (
    db, SplitRoom, SplitMember, SplitExpense,
    SplitExpensePayer, SplitExpenseShare,
    SplitSettlementPayment, SplitActivity
)

DECIMAL_ZERO = Decimal('0.00')
DECIMAL_CENT = Decimal('0.01')


def to_decimal(val: Any) -> Decimal:
    """Safely convert any numeric / string value to a 2-decimal place Decimal."""
    if val is None:
        return DECIMAL_ZERO
    try:
        return Decimal(str(val)).quantize(DECIMAL_CENT, rounding=ROUND_HALF_UP)
    except Exception:
        return DECIMAL_ZERO


def calculate_shares(total_amount: Decimal, split_method: str, participants: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Computes deterministic shares for participants based on split_method.
    Guarantees that sum(share_amount) == total_amount to the exact cent.
    
    participants format:
      EQUAL: [{'user_id': 1}, ...]
      EXACT: [{'user_id': 1, 'amount': 250.00}, ...]
      PERCENTAGE: [{'user_id': 1, 'percentage': 50.0}, ...]
      SHARES: [{'user_id': 1, 'shares': 2.0}, ...]
    """
    if not participants:
        raise ValueError("At least one participant must be selected for the expense.")
    if total_amount <= Decimal('0.00'):
        raise ValueError("Expense amount must be greater than zero.")

    n = len(participants)
    method = split_method.upper()

    if method == 'EQUAL':
        base_share = (total_amount / Decimal(n)).quantize(DECIMAL_CENT, rounding=ROUND_FLOOR)
        total_base = base_share * Decimal(n)
        remainder_cents = int((total_amount - total_base) * 100)

        result = []
        for i, p in enumerate(participants):
            share = base_share + (DECIMAL_CENT if i < remainder_cents else DECIMAL_ZERO)
            result.append({
                'user_id': p['user_id'],
                'share_amount': share,
                'raw_value': None
            })
        return result

    elif method in ('EXACT', 'UNEQUAL'):
        result = []
        running_sum = DECIMAL_ZERO
        for p in participants:
            amt = to_decimal(p.get('amount', 0))
            if amt < DECIMAL_ZERO:
                raise ValueError("Participant shares cannot be negative.")
            running_sum += amt
            result.append({
                'user_id': p['user_id'],
                'share_amount': amt,
                'raw_value': None
            })
        if abs(running_sum - total_amount) > Decimal('0.01'):
            diff = total_amount - running_sum
            raise ValueError(
                f"Custom shares total (₹{running_sum:.2f}) does not match expense total (₹{total_amount:.2f}). Difference: ₹{diff:+.2f}"
            )
        # Absorb rounding cent discrepancy into the first share if within 0.01
        if running_sum != total_amount and result:
            result[0]['share_amount'] += (total_amount - running_sum)
        return result

    elif method == 'PERCENTAGE':
        total_pct = Decimal('0.0')
        pct_list = []
        for p in participants:
            raw_pct = Decimal(str(p.get('percentage', 0)))
            if raw_pct < Decimal('0.0'):
                raise ValueError("Percentages cannot be negative.")
            total_pct += raw_pct
            pct_list.append((p['user_id'], raw_pct))

        if abs(total_pct - Decimal('100.0')) > Decimal('0.05'):
            raise ValueError(f"Percentages must total 100%. Current total: {total_pct:.2f}%")

        # Convert to monetary shares
        result = []
        running_allocated = DECIMAL_ZERO
        for uid, pct in pct_list:
            share = (total_amount * (pct / Decimal('100.0'))).quantize(DECIMAL_CENT, rounding=ROUND_FLOOR)
            running_allocated += share
            result.append({
                'user_id': uid,
                'share_amount': share,
                'raw_value': pct
            })

        remainder_cents = int((total_amount - running_allocated) * 100)
        # Distribute remainder paise to the first participants
        for i in range(min(remainder_cents, len(result))):
            result[i]['share_amount'] += DECIMAL_CENT

        return result

    elif method in ('SHARES', 'RATIO'):
        total_shares = Decimal('0.0')
        shares_list = []
        for p in participants:
            raw_s = Decimal(str(p.get('shares', 1)))
            if raw_s <= Decimal('0.0'):
                raise ValueError("Share counts must be positive numbers.")
            total_shares += raw_s
            shares_list.append((p['user_id'], raw_s))

        if total_shares <= Decimal('0.0'):
            raise ValueError("Total shares must be greater than zero.")

        result = []
        running_allocated = DECIMAL_ZERO
        for uid, s in shares_list:
            share = (total_amount * (s / total_shares)).quantize(DECIMAL_CENT, rounding=ROUND_FLOOR)
            running_allocated += share
            result.append({
                'user_id': uid,
                'share_amount': share,
                'raw_value': s
            })

        remainder_cents = int((total_amount - running_allocated) * 100)
        for i in range(min(remainder_cents, len(result))):
            result[i]['share_amount'] += DECIMAL_CENT

        return result

    else:
        raise ValueError(f"Unknown split method: {split_method}")


def simplify_settlements(balances_map: Dict[int, Decimal], users_map: Dict[int, Any]) -> List[Dict[str, Any]]:
    """
    Greedy debtor-creditor matching algorithm.
    Minimizes the number of settlement payments required to settle group debts.
    
    balances_map: {user_id: outstanding_balance}
      positive balance = creditor (is owed money)
      negative balance = debtor (owes money)
      zero balance = settled
    """
    debtors = []
    creditors = []

    for uid, bal in balances_map.items():
        if bal < -Decimal('0.005'):
            debtors.append({
                'user_id': uid,
                'amount': abs(bal)
            })
        elif bal > Decimal('0.005'):
            creditors.append({
                'user_id': uid,
                'amount': bal
            })

    debtors.sort(key=lambda d: d['amount'], reverse=True)
    creditors.sort(key=lambda c: c['amount'], reverse=True)

    suggestions = []
    i = 0
    j = 0

    while i < len(debtors) and j < len(creditors):
        debtor = debtors[i]
        creditor = creditors[j]

        transfer_amt = min(debtor['amount'], creditor['amount']).quantize(DECIMAL_CENT, rounding=ROUND_HALF_UP)

        if transfer_amt > Decimal('0.00'):
            debtor_user = users_map.get(debtor['user_id'])
            creditor_user = users_map.get(creditor['user_id'])

            suggestions.append({
                'from_user_id': debtor['user_id'],
                'from_user_name': debtor_user.full_name if debtor_user else f"User #{debtor['user_id']}",
                'from_user_avatar': debtor_user.avatar if (debtor_user and debtor_user.avatar) else '/game_avatar.png',
                'to_user_id': creditor['user_id'],
                'to_user_name': creditor_user.full_name if creditor_user else f"User #{creditor['user_id']}",
                'to_user_avatar': creditor_user.avatar if (creditor_user and creditor_user.avatar) else '/game_avatar.png',
                'amount': float(transfer_amt),
                'amount_decimal': transfer_amt,
            })

        debtor['amount'] -= transfer_amt
        creditor['amount'] -= transfer_amt

        if debtor['amount'] <= Decimal('0.005'):
            i += 1
        if creditor['amount'] <= Decimal('0.005'):
            j += 1

    return suggestions


def compute_room_financials(room_id: int) -> Dict[str, Any]:
    """
    Authoritative backend balance and settlement calculation for a Split Room.
    Returns:
      - members_balances: list of each member's financial position
      - settlement_plan: simplified suggested transfers with payment statuses
      - summary: overall room financial metrics
      - payments: recent settlement payment records
    """
    room = SplitRoom.query.get(room_id)
    if not room:
        raise ValueError("Room not found")

    members = SplitMember.query.filter_by(room_id=room_id).all()
    user_ids = [m.user_id for m in members]
    users_map = {m.user_id: m.user for m in members if m.user}

    # Fetch non-deleted expenses
    expenses = SplitExpense.query.filter_by(room_id=room_id, is_deleted=False).all()

    # Total group spending
    total_spent_dec = Decimal('0.00')
    for e in expenses:
        total_spent_dec += to_decimal(e.amount)

    # Initialize per-member tallies
    total_paid_map = {uid: Decimal('0.00') for uid in user_ids}
    total_share_map = {uid: Decimal('0.00') for uid in user_ids}

    for exp in expenses:
        for p in exp.payers:
            if p.user_id in total_paid_map:
                total_paid_map[p.user_id] += to_decimal(p.amount_paid)
        for s in exp.shares:
            if s.user_id in total_share_map:
                total_share_map[s.user_id] += to_decimal(s.share_amount)

    # Calculate net expense balance for each member: Paid - Share
    net_expense_balance_map = {}
    for uid in user_ids:
        net_expense_balance_map[uid] = (total_paid_map[uid] - total_share_map[uid]).quantize(DECIMAL_CENT, rounding=ROUND_HALF_UP)

    # Fetch settlement payments
    payments = SplitSettlementPayment.query.filter_by(room_id=room_id).order_by(SplitSettlementPayment.created_at.desc()).all()

    confirmed_sent_map = {uid: Decimal('0.00') for uid in user_ids}
    confirmed_received_map = {uid: Decimal('0.00') for uid in user_ids}
    pending_sent_map = {uid: Decimal('0.00') for uid in user_ids}
    pending_received_map = {uid: Decimal('0.00') for uid in user_ids}

    # Pairwise confirmed and pending payment tracking
    pairwise_confirmed = {}  # (payer_id, recipient_id) -> Decimal
    pairwise_reported = {}   # (payer_id, recipient_id) -> Decimal

    for p in payments:
        p_amt = to_decimal(p.amount)
        pair = (p.payer_id, p.recipient_id)

        if p.status == 'CONFIRMED':
            if p.payer_id in confirmed_sent_map:
                confirmed_sent_map[p.payer_id] += p_amt
            if p.recipient_id in confirmed_received_map:
                confirmed_received_map[p.recipient_id] += p_amt
            pairwise_confirmed[pair] = pairwise_confirmed.get(pair, Decimal('0.00')) + p_amt

        elif p.status == 'REPORTED':
            if p.payer_id in pending_sent_map:
                pending_sent_map[p.payer_id] += p_amt
            if p.recipient_id in pending_received_map:
                pending_received_map[p.recipient_id] += p_amt
            pairwise_reported[pair] = pairwise_reported.get(pair, Decimal('0.00')) + p_amt

    # Outstanding balance = Net Expense Balance + Confirmed Sent - Confirmed Received
    # Debtor (negative net) paying money sent (+ confirmed_sent) brings balance closer to 0!
    outstanding_balance_map = {}
    for uid in user_ids:
        bal = net_expense_balance_map[uid] + confirmed_sent_map[uid] - confirmed_received_map[uid]
        outstanding_balance_map[uid] = bal.quantize(DECIMAL_CENT, rounding=ROUND_HALF_UP)

    # Simplified settlement plan
    raw_suggestions = simplify_settlements(outstanding_balance_map, users_map)

    # Enrich suggestions with payment state and history
    settlement_plan = []
    for sug in raw_suggestions:
        from_id = sug['from_user_id']
        to_id = sug['to_user_id']
        suggested_amt = sug['amount_decimal']
        
        pair = (from_id, to_id)
        confirmed_amt = pairwise_confirmed.get(pair, Decimal('0.00'))
        reported_amt = pairwise_reported.get(pair, Decimal('0.00'))

        # Determine status
        status = 'PENDING'
        if suggested_amt <= Decimal('0.005'):
            status = 'SETTLED'
        elif reported_amt > Decimal('0.00'):
            status = 'REPORTED'
        elif confirmed_amt > Decimal('0.00'):
            status = 'PARTIALLY_PAID'

        settlement_plan.append({
            'from_user_id': from_id,
            'from_user_name': sug['from_user_name'],
            'from_user_avatar': sug['from_user_avatar'],
            'to_user_id': to_id,
            'to_user_name': sug['to_user_name'],
            'to_user_avatar': sug['to_user_avatar'],
            'amount': float(suggested_amt),
            'confirmed_paid': float(confirmed_amt),
            'pending_reported': float(reported_amt),
            'status': status
        })

    # Prepare members balances array
    members_balances = []
    total_positive_debt = Decimal('0.00')

    for m in members:
        uid = m.user_id
        user = m.user
        paid = total_paid_map[uid]
        share = total_share_map[uid]
        net_exp = net_expense_balance_map[uid]
        out_bal = outstanding_balance_map[uid]
        c_sent = confirmed_sent_map[uid]
        c_recv = confirmed_received_map[uid]
        p_sent = pending_sent_map[uid]
        p_recv = pending_received_map[uid]

        if out_bal < -Decimal('0.005'):
            total_positive_debt += abs(out_bal)
            status_label = f"Owes ₹{abs(out_bal):,.2f}"
            status_type = 'OWES'
        elif out_bal > Decimal('0.005'):
            status_label = f"Is owed ₹{out_bal:,.2f}"
            status_type = 'IS_OWED'
        else:
            status_label = "Settled"
            status_type = 'SETTLED'

        members_balances.append({
            'user_id': uid,
            'user_name': user.full_name if user else f"User #{uid}",
            'user_email': user.email if user else "",
            'user_avatar': user.avatar if (user and user.avatar) else '/game_avatar.png',
            'role': m.role,
            'total_paid': float(paid),
            'total_share': float(share),
            'net_expense_balance': float(net_exp),
            'confirmed_sent': float(c_sent),
            'confirmed_received': float(c_recv),
            'pending_sent': float(p_sent),
            'pending_received': float(p_recv),
            'outstanding_balance': float(out_bal),
            'status_label': status_label,
            'status_type': status_type
        })

    # Total settled amount so far
    total_settled_amount = sum(to_decimal(p.amount) for p in payments if p.status == 'CONFIRMED')
    
    is_fully_settled = (total_positive_debt <= Decimal('0.005') and len(expenses) > 0) or (len(expenses) == 0)

    # Calculate settlement progress: ratio of settled debt to total debt volume
    total_debt_volume = total_settled_amount + total_positive_debt
    if is_fully_settled:
        progress_pct = 100.0
    elif total_debt_volume > Decimal('0.00'):
        raw_pct = float(((total_settled_amount / total_debt_volume) * Decimal('100.0')).quantize(DECIMAL_CENT, rounding=ROUND_HALF_UP))
        # When debt remains, progress must never display 100%
        progress_pct = min(99.0, max(0.0, raw_pct))
    else:
        progress_pct = 0.0

    # Sync room.is_settled flag if changed
    if room.is_settled != is_fully_settled:
        room.is_settled = is_fully_settled
        db.session.commit()

    return {
        'total_spent': float(total_spent_dec),
        'expenses_count': len(expenses),
        'members_count': len(members),
        'total_outstanding_debt': float(total_positive_debt),
        'total_settled_amount': float(total_settled_amount),
        'settlement_progress_percentage': round(progress_pct, 1),
        'is_fully_settled': is_fully_settled,
        'members_balances': members_balances,
        'settlement_plan': settlement_plan,
        'payments': [p.to_dict() for p in payments]
    }
