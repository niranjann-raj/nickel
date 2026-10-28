from datetime import date
from models import db, User, Goal, GoalAutoSaving, TrackerTransaction

def build_nickel_context(user_id: int) -> str:
    """
    Collects real-time financial context for a user to be supplied to the AI.
    Calculates deterministic metrics so Gemini doesn't have to guess or calculate.
    """
    user = User.query.get(user_id)
    if not user:
        return "User context unavailable."
        
    from scheduler import get_user_net_cash_flow
    net_cash_flow = get_user_net_cash_flow(user.id)
    
    # 1. User Profile Context
    name = user.full_name or user.email.split('@')[0].capitalize()
    
    # Safely handle potential None values
    safe_xp = user.xp or 0
    safe_streak = user.get_active_streak()
    safe_coins = user.coins or 0
    goals_saved = sum(float(g.saved_amount or 0.0) for g in Goal.query.filter_by(user_id=user.id).all())

    profile_str = (
        f"USER PROFILE:\n"
        f"- Name: {name}\n"
        f"- Gamification: Level {user.level}, XP {safe_xp}, Streak {safe_streak} days, Coins {safe_coins}\n"
        f"- Expense Tracker Net Cash Flow: ₹{net_cash_flow:,.2f}\n"
        f"- Total Saved in Goals: ₹{goals_saved:,.2f}\n"
    )
    
    # 2. Goals Context
    active_goals = Goal.query.filter_by(user_id=user.id, status='ACTIVE').all()
    goals_context = []
    
    for g in active_goals:
        # Fetch auto saving schedule for this goal
        auto_saving = GoalAutoSaving.query.filter_by(goal_id=g.id).first()
        
        safe_target_amount = g.target_amount or 0.0
        safe_saved_amount = g.saved_amount or 0.0
        
        remaining = max(0, safe_target_amount - safe_saved_amount)
        progress = (safe_saved_amount / safe_target_amount * 100) if safe_target_amount > 0 else 0
        
        # Calculate days remaining until target date
        days_remaining = (g.current_completion_date - date.today()).days if g.current_completion_date else 0
        
        goal_str = (
            f"  * Goal Name: {g.name}\n"
            f"    - Target Amount: ₹{safe_target_amount:,.2f}\n"
            f"    - Saved Amount: ₹{safe_saved_amount:,.2f}\n"
            f"    - Remaining Amount: ₹{remaining:,.2f}\n"
            f"    - Progress: {progress:.1f}%\n"
            f"    - Target Date: {g.current_completion_date.strftime('%b %d, %Y') if g.current_completion_date else 'Unknown'}\n"
            f"    - Days Remaining: {days_remaining} days\n"
        )
        
        if auto_saving:
            safe_auto_amount = auto_saving.amount or 0.0
            goal_str += f"    - AutoPay Frequency: {auto_saving.frequency}\n"
            goal_str += f"    - AutoPay Amount: ₹{safe_auto_amount:,.2f}\n"
            goal_str += f"    - Next Deduction: {auto_saving.next_run_date.strftime('%b %d, %Y') if auto_saving.next_run_date else 'Unknown'}\n"
            
            # Estimate required daily saving for remaining amount
            if days_remaining > 0:
                required_daily = remaining / days_remaining
                goal_str += f"    - Required Daily Saving to reach on time: ₹{required_daily:,.2f}\n"
        else:
            goal_str += "    - AutoPay: Not configured\n"
            
        goals_context.append(goal_str)
        
    goals_str = "ACTIVE GOALS:\n" + ("\n".join(goals_context) if goals_context else "No active goals.\n")
    
    # 3. Recent Transactions Context (Expense Tracker)
    recent_txs = TrackerTransaction.query.filter_by(user_id=user.id).order_by(TrackerTransaction.date.desc(), TrackerTransaction.id.desc()).limit(10).all()
    tx_context = []
    for t in recent_txs:
        date_str = t.date.strftime('%Y-%m-%d') if t.date else "Unknown Date"
        tx_context.append(f"  * {date_str} - {t.type} of ₹{float(t.amount or 0):,.2f}: {t.merchant or t.description or 'Expense'}")
        
    # 4. Expense Tracker Spending Context (Current Month)
    tracker_context_str = "EXPENSE TRACKER (Current Month):\n"
    try:
        from models import TrackerTransaction, TrackerSubscription
        from datetime import date
        today = date.today()
        month_start = today.replace(day=1)
        month_txs = TrackerTransaction.query.filter(
            TrackerTransaction.user_id == user.id,
            TrackerTransaction.transaction_date >= month_start
        ).all()

        month_expenses = sum(float(t.amount) for t in month_txs if t.type == 'EXPENSE')
        month_income = sum(float(t.amount) for t in month_txs if t.type == 'INCOME')

        # Top 3 categories
        cat_map = {}
        for t in month_txs:
            if t.type == 'EXPENSE':
                c = t.category_name or 'Other'
                cat_map[c] = cat_map.get(c, 0.0) + float(t.amount)
        top_cats = sorted(cat_map.items(), key=lambda x: x[1], reverse=True)[:3]
        top_cats_str = ", ".join([f"{c[0]}: ₹{c[1]:,.2f}" for c in top_cats]) if top_cats else "None"

        # Subscriptions
        subs = TrackerSubscription.query.filter_by(user_id=user.id, status='ACTIVE').all()
        subs_cost = sum(float(s.amount) for s in subs)

        tracker_context_str += (
            f"  * Month Expenses: ₹{month_expenses:,.2f}\n"
            f"  * Month Income: ₹{month_income:,.2f}\n"
            f"  * Top Categories: {top_cats_str}\n"
            f"  * Active Subscriptions: {len(subs)} (Total ₹{subs_cost:,.2f}/mo)\n"
        )

        # Recent 5 tracker transactions
        recent_tracker = TrackerTransaction.query.filter_by(user_id=user.id).order_by(TrackerTransaction.transaction_date.desc(), TrackerTransaction.id.desc()).limit(5).all()
        if recent_tracker:
            tracker_context_str += "  * Recent Spending:\n"
            for rt in recent_tracker:
                d_str = rt.transaction_date.strftime('%b %d') if rt.transaction_date else "Recent"
                m_str = f" at {rt.merchant}" if rt.merchant else ""
                tracker_context_str += f"    - {d_str}: {rt.type} ₹{float(rt.amount):,.2f} ({rt.category_name}{m_str})\n"
    except Exception as e:
        tracker_context_str += "  Expense tracker data currently unavailable.\n"

    # Compile the final context string
    full_context = f"{profile_str}\n{goals_str}\n{txs_str}\n{tracker_context_str}"
    
    return full_context

