from datetime import date
from models import db, User, Goal, GoalAutoSaving, BankAccount, Transaction

def build_nickel_context(user_id: int) -> str:
    """
    Collects real-time financial context for a user to be supplied to the AI.
    Calculates deterministic metrics so Gemini doesn't have to guess or calculate.
    """
    user = User.query.get(user_id)
    if not user:
        return "User context unavailable."
        
    bank_account = BankAccount.query.filter_by(user_id=user.id).first()
    balance = bank_account.balance if bank_account and bank_account.balance is not None else 0.0
    
    # 1. User Profile Context
    name = user.full_name or user.email.split('@')[0].capitalize()
    
    # Safely handle potential None values
    safe_xp = user.xp or 0
    safe_streak = user.current_streak or 0
    safe_coins = user.coins or 0
    safe_total_saved = user.total_saved or 0.0

    profile_str = (
        f"USER PROFILE:\n"
        f"- Name: {name}\n"
        f"- Gamification: Level {user.level}, XP {safe_xp}, Streak {safe_streak} days, Coins {safe_coins}\n"
        f"- Dummy Bank Balance: ₹{balance:,.2f}\n"
        f"- Total Lifetime Savings: ₹{safe_total_saved:,.2f}\n"
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
    
    # 3. Recent Transactions Context
    recent_txs = Transaction.query.filter_by(user_id=user.id).order_by(Transaction.created_at.desc()).limit(10).all()
    tx_context = []
    for t in recent_txs:
        date_str = t.created_at.strftime('%Y-%m-%d %H:%M') if t.created_at else "Unknown Date"
        tx_context.append(f"  * {date_str} - {t.type} of ₹{t.amount:,.2f}: {t.description}")
        
    txs_str = "RECENT TRANSACTIONS (Last 10):\n" + ("\n".join(tx_context) if tx_context else "  No recent transactions.\n")
    
    # Compile the final context string
    full_context = f"{profile_str}\n{goals_str}\n{txs_str}"
    
    return full_context
