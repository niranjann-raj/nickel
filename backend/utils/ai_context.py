from datetime import date, datetime, timedelta
from models import (
    db, User, Goal, GoalAutoSaving, GoalTransaction,
    TrackerTransaction, TrackerSubscription, TrackerCategory,
    SplitRoom, SplitExpense, SplitExpenseShare, SplitMember
)

def build_nickel_context(user_id: int) -> str:
    """
    Collects real-time financial context across all Nickel modules for a user.
    Supplies structured, authoritative metrics to the AI coach so it answers accurately.
    """
    user = User.query.get(user_id)
    if not user:
        return "User context unavailable."

    today = date.today()
    month_start = today.replace(day=1)

    from scheduler import get_user_net_cash_flow
    net_cash_flow = get_user_net_cash_flow(user.id)

    # -------------------------------------------------------------
    # 1. USER PROFILE & GAMIFICATION
    # -------------------------------------------------------------
    name = user.full_name or user.email.split('@')[0].capitalize()
    safe_streak = user.get_active_streak()
    safe_xp = user.xp or 0
    safe_coins = user.coins or 0
    safe_shields = user.streak_shields or 0

    goals = Goal.query.filter_by(user_id=user.id).all()
    total_saved_in_goals = sum(float(g.saved_amount or 0.0) for g in goals)

    profile_str = (
        f"USER OVERVIEW:\n"
        f"- Name: {name} (Email: {user.email})\n"
        f"- Gamification: Level {user.level}, XP {safe_xp}, Daily Streak {safe_streak} days, Coins {safe_coins}, Streak Shields {safe_shields}\n"
        f"- Expense Tracker Net Cash Flow (Current Balance): ₹{net_cash_flow:,.2f}\n"
        f"- Total Money Saved in Goal-Based Savings: ₹{total_saved_in_goals:,.2f}\n"
    )

    # -------------------------------------------------------------
    # 2. GOAL-BASED SAVINGS MODULE
    # -------------------------------------------------------------
    active_goals = [g for g in goals if g.status == 'ACTIVE']
    completed_goals = [g for g in goals if g.status == 'COMPLETED']
    paused_goals = [g for g in goals if g.status == 'PAUSED']

    goals_context = []
    for g in goals:
        auto_saving = GoalAutoSaving.query.filter_by(goal_id=g.id).first()
        target_amt = float(g.target_amount or 0.0)
        saved_amt = float(g.saved_amount or 0.0)
        remaining = max(0.0, target_amt - saved_amt)
        progress = (saved_amt / target_amt * 100) if target_amt > 0 else 0.0
        days_rem = (g.current_completion_date - today).days if g.current_completion_date else None

        g_info = [
            f"  * Goal '{g.name}' [{g.status}]:",
            f"    - Target Amount: ₹{target_amt:,.2f} | Saved So Far: ₹{saved_amt:,.2f} ({progress:.1f}%) | Remaining: ₹{remaining:,.2f}",
        ]
        if g.current_completion_date:
            g_info.append(f"    - Target Completion Date: {g.current_completion_date.strftime('%b %d, %Y')} ({days_rem} days remaining)")
        
        if auto_saving:
            g_info.append(f"    - AutoPay Setting: ₹{float(auto_saving.amount or 0):,.2f} ({auto_saving.frequency})")
            if auto_saving.next_run_date:
                g_info.append(f"    - Next Scheduled AutoPay Debit: {auto_saving.next_run_date.strftime('%b %d, %Y')} at 1:00 AM")
            if days_rem and days_rem > 0:
                req_daily = remaining / days_rem
                g_info.append(f"    - Required Daily Saving Pace: ₹{req_daily:,.2f}/day to reach goal on time")
        else:
            g_info.append("    - AutoPay: Not configured")

        goals_context.append("\n".join(g_info))

    goals_str = (
        f"GOAL-BASED SAVINGS:\n"
        f"- Active Goals: {len(active_goals)}, Paused Goals: {len(paused_goals)}, Completed Goals: {len(completed_goals)}\n"
        + ("\n".join(goals_context) if goals_context else "  No goals created yet.\n")
    )

    # -------------------------------------------------------------
    # 3. EXPENSE TRACKER MODULE
    # -------------------------------------------------------------
    all_txs = TrackerTransaction.query.filter_by(user_id=user.id).order_by(
        TrackerTransaction.transaction_date.desc(),
        TrackerTransaction.id.desc()
    ).all()

    lifetime_income = sum(float(t.amount or 0) for t in all_txs if t.type == 'INCOME')
    lifetime_expense = sum(float(t.amount or 0) for t in all_txs if t.type == 'EXPENSE')

    # Current month
    month_txs = [t for t in all_txs if t.transaction_date and t.transaction_date >= month_start]
    month_income = sum(float(t.amount or 0) for t in month_txs if t.type == 'INCOME')
    month_expense = sum(float(t.amount or 0) for t in month_txs if t.type == 'EXPENSE')
    month_surplus = month_income - month_expense

    # Categorized expenses breakdown
    expense_txs = [t for t in all_txs if t.type == 'EXPENSE']
    cat_totals = {}
    for t in expense_txs:
        cat = t.category_name or 'Other / General'
        cat_totals[cat] = cat_totals.get(cat, 0.0) + float(t.amount or 0)
    sorted_cats = sorted(cat_totals.items(), key=lambda x: x[1], reverse=True)

    # Highest individual expenses
    sorted_highest_expenses = sorted(expense_txs, key=lambda x: float(x.amount or 0), reverse=True)[:5]
    highest_expenses_str = []
    for he in sorted_highest_expenses:
        d_str = he.transaction_date.strftime('%b %d, %Y') if he.transaction_date else 'Recent'
        name_desc = he.merchant or he.description or he.category_name or 'Expense'
        highest_expenses_str.append(f"    - ₹{float(he.amount):,.2f} on {d_str} [{he.category_name}]: {name_desc}")

    # Recent transactions
    recent_txs_str = []
    for rt in all_txs[:10]:
        d_str = rt.transaction_date.strftime('%b %d, %Y') if rt.transaction_date else 'Recent'
        label = rt.merchant or rt.description or 'Transaction'
        recent_txs_str.append(f"    - {d_str} | {rt.type} ₹{float(rt.amount):,.2f} | Category: {rt.category_name or 'Other'} | Note: {label}")

    # Subscriptions
    subs = TrackerSubscription.query.filter_by(user_id=user.id, status='ACTIVE').all()
    subs_total = sum(float(s.amount or 0) for s in subs)
    subs_str = [f"    - {s.name}: ₹{float(s.amount):,.2f}/{s.frequency or 'month'}" for s in subs]

    cat_breakdown_str = "\n".join([f"    - {c[0]}: ₹{c[1]:,.2f} ({ (c[1]/lifetime_expense*100) if lifetime_expense > 0 else 0:.1f}%)" for c in sorted_cats]) if sorted_cats else "    - No expenses recorded yet."

    tracker_str = (
        f"EXPENSE TRACKER DATA:\n"
        f"- Net Cash Flow: ₹{net_cash_flow:,.2f} (Total Income: ₹{lifetime_income:,.2f}, Total Expenses: ₹{lifetime_expense:,.2f})\n"
        f"- Current Month ({today.strftime('%B %Y')}): Income ₹{month_income:,.2f}, Expenses ₹{month_expense:,.2f}, Net Surplus: ₹{month_surplus:,.2f}\n"
        f"- Spending by Category (Ranked Highest to Lowest):\n{cat_breakdown_str}\n"
        f"- Top 5 Largest Individual Expenses:\n"
        + ("\n".join(highest_expenses_str) if highest_expenses_str else "    - None.\n")
        + f"\n- Active Subscriptions ({len(subs)} total, ₹{subs_total:,.2f}/mo):\n"
        + ("\n".join(subs_str) if subs_str else "    - No active subscriptions.\n")
        + f"\n- Recent 10 Transactions:\n"
        + ("\n".join(recent_txs_str) if recent_txs_str else "    - No transactions found.\n")
    )

    # -------------------------------------------------------------
    # 4. SPLIT EXPENSES MODULE
    # -------------------------------------------------------------
    rooms = SplitRoom.query.all()
    user_rooms = []
    for r in rooms:
        m = SplitMember.query.filter_by(room_id=r.id, user_id=user.id).first()
        if m:
            user_rooms.append(r)

    split_str = f"SPLIT EXPENSES DATA:\n- Active Groups / Rooms: {len(user_rooms)}\n"
    if user_rooms:
        for ur in user_rooms:
            expenses = SplitExpense.query.filter_by(room_id=ur.id, is_deleted=False).all()
            total_room_spent = sum(float(e.amount or 0) for e in expenses)
            split_str += f"  * Group '{ur.name}': {len(expenses)} expenses logged (Total group spend: ₹{total_room_spent:,.2f})\n"
    else:
        split_str += "  - No active split expense groups.\n"

    # Combine all module contexts
    return f"{profile_str}\n{goals_str}\n{tracker_str}\n{split_str}"
