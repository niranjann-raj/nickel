from apscheduler.schedulers.background import BackgroundScheduler
from models import db, User, Goal, GoalAutoSaving, GoalTransaction
from routes.dashboard import level_up
from datetime import date

def get_user_net_cash_flow(user_id, as_of_date=None, start_date=None, end_date=None):
    """
    Calculates net cash flow (total income - total expenses) from the Expense Tracker for the user.
    Defaults to the current month (matching Expense Tracker's active overview period)
    to guarantee consistent numbers between Expense Tracker and Goal-Based Savings.
    """
    from models import TrackerTransaction
    from sqlalchemy import func
    from decimal import Decimal
    from datetime import date

    today = as_of_date or date.today()
    if start_date is None:
        start_date = today.replace(day=1)
    if end_date is None:
        end_date = today

    inc = db.session.query(func.coalesce(func.sum(TrackerTransaction.amount), Decimal('0.00')))\
        .filter(
            TrackerTransaction.user_id == user_id,
            TrackerTransaction.type == 'INCOME',
            TrackerTransaction.transaction_date >= start_date,
            TrackerTransaction.transaction_date <= end_date
        )\
        .scalar()

    exp = db.session.query(func.coalesce(func.sum(TrackerTransaction.amount), Decimal('0.00')))\
        .filter(
            TrackerTransaction.user_id == user_id,
            TrackerTransaction.type == 'EXPENSE',
            TrackerTransaction.transaction_date >= start_date,
            TrackerTransaction.transaction_date <= end_date
        )\
        .scalar()

    net = Decimal(str(inc)) - Decimal(str(exp))
    return float(net)

def process_goal_autopay(auto_saving, today):
    from models import TrackerTransaction
    from decimal import Decimal
    from datetime import datetime, timezone, timedelta

    goal = Goal.query.get(auto_saving.goal_id)
    if not goal:
        return False, "Goal not found", None, 0.0

    if goal.status != 'ACTIVE':
        return False, f"Goal is currently {goal.status}", None, 0.0

    user = User.query.get(goal.user_id)
    if not user:
        return False, "User not found", None, 0.0

    amount = float(auto_saving.amount)
    if amount <= 0:
        return False, "AutoPay amount must be greater than 0", None, 0.0

    # Check available funds in Expense Tracker Net Cash Flow
    net_cash_flow = get_user_net_cash_flow(user.id, as_of_date=today)

    if net_cash_flow >= amount:
        # Success: Debit from Expense Tracker
        tracker_tx = TrackerTransaction(
            user_id=user.id,
            type='EXPENSE',
            amount=Decimal(str(amount)),
            currency='INR',
            category_name='Savings',
            merchant=f"{goal.name} + autopay debit",
            description=f"AutoPay debit for goal: {goal.name}",
            transaction_date=today,
            payment_method='AutoPay',
            tags='autopay,goal-savings',
            created_at=datetime.now(timezone.utc)
        )
        db.session.add(tracker_tx)

        # Credit to Goal
        goal.saved_amount += amount

        # Check completion
        if goal.saved_amount >= goal.target_amount:
            goal.status = 'COMPLETED'
            goal.current_completion_date = today

        tx = GoalTransaction(
            goal_id=goal.id,
            type='GOAL_AUTOPAY',
            amount=amount,
            status='SUCCESS',
            source='Net Cash Flow',
            destination='Goal Wallet',
            description=f"AutoPay: Saved ₹{amount:,.2f} for {goal.name} from Net Cash Flow",
            remaining_balance=max(0.0, goal.target_amount - goal.saved_amount),
            current_balance=goal.saved_amount
        )
        db.session.add(tx)

        # ── Streak and XP Logic for Goal-based Savings ──
        # Streak and 50 XP daily bonus ONLY work when autopay frequency is set to DAILY
        streak_maintained = False
        daily_streak_xp = 0

        if auto_saving.frequency == 'DAILY':
            if user.last_save_date == today:
                # Already saved towards a daily goal today
                streak_maintained = True
            elif user.last_save_date == today - timedelta(days=1):
                # Consecutive day: streak incremented and maintained
                user.current_streak = (user.current_streak or 0) + 1
                user.last_save_date = today
                streak_maintained = True
                daily_streak_xp = 50
                user.xp += daily_streak_xp
                user.lifetime_xp += daily_streak_xp
                try:
                    level_up(user)
                except Exception as e:
                    print(f"level_up error: {e}")
            else:
                # First day of streak or recovering from lapse
                if user.last_save_date and (today - user.last_save_date).days > 1 and (user.streak_shields or 0) > 0:
                    user.streak_shields -= 1
                    user.current_streak = (user.current_streak or 0) + 1
                else:
                    user.current_streak = 1

                user.last_save_date = today
                streak_maintained = True
                daily_streak_xp = 50
                user.xp += daily_streak_xp
                user.lifetime_xp += daily_streak_xp
                try:
                    level_up(user)
                except Exception as e:
                    print(f"level_up error: {e}")

        # Update next_run_date
        if auto_saving.frequency == 'DAILY':
            auto_saving.next_run_date = today + timedelta(days=1)
        elif auto_saving.frequency == 'WEEKLY':
            auto_saving.next_run_date = today + timedelta(days=7)
        elif auto_saving.frequency == 'MONTHLY':
            auto_saving.next_run_date = today + timedelta(days=30)
        elif auto_saving.frequency == 'CUSTOM' and auto_saving.custom_days:
            auto_saving.next_run_date = today + timedelta(days=auto_saving.custom_days)

        db.session.commit()
        remaining_cash_flow = net_cash_flow - amount
        print(f"[Goal Autopay] Success for Goal {goal.id} - Debited INR {amount} from Net Cash Flow. Streak: {user.current_streak}")

        if auto_saving.frequency == 'DAILY':
            if daily_streak_xp > 0:
                success_msg = f"AutoPay executed successfully! Debited ₹{amount:,.2f} from Net Cash Flow. 🔥 Daily Streak: {user.current_streak} days (+{daily_streak_xp} XP earned!)"
            else:
                success_msg = f"AutoPay executed successfully! Debited ₹{amount:,.2f} from Net Cash Flow. 🔥 Daily Streak maintained for today ({user.current_streak} days)."
        else:
            success_msg = f"AutoPay executed successfully! Debited ₹{amount:,.2f} from Net Cash Flow."

        return True, success_msg, tx, remaining_cash_flow
    else:
        # Failed: Insufficient funds in Net Cash Flow
        goal.status = 'PAUSED'

        # Check if daily streak has lapsed from missed previous days
        if auto_saving.frequency == 'DAILY' and user.last_save_date and (today - user.last_save_date).days > 1:
            if (user.streak_shields or 0) > 0:
                user.streak_shields -= 1
                user.last_save_date = today - timedelta(days=1)
                print(f"[Goal Autopay] User {user.id} daily goal failed and previous days missed, streak shield used! Shields left: {user.streak_shields}")
            else:
                user.current_streak = 0
                print(f"[Goal Autopay] User {user.id} daily goal failed and previous days missed, streak reset to 0.")

        reason = f"Insufficient balance in Net Cash Flow (₹{net_cash_flow:,.2f} available, ₹{amount:,.2f} required)"
        tx = GoalTransaction(
            goal_id=goal.id,
            type='GOAL_AUTOPAY',
            amount=amount,
            status='FAILED',
            source='Net Cash Flow',
            destination='Goal Wallet',
            reason=reason,
            description=f"AutoPay Failed: Insufficient balance in Net Cash Flow for {goal.name}",
            remaining_balance=max(0.0, goal.target_amount - goal.saved_amount),
            current_balance=goal.saved_amount
        )
        db.session.add(tx)
        db.session.commit()
        print(f"[Goal Autopay] Failed for Goal {goal.id} - Insufficient Balance in Net Cash Flow")
        return False, reason, tx, net_cash_flow

def execute_goal_autopay_job(app):
    with app.app_context():
        today = date.today()
        # Find auto savings that need to run today or are overdue
        auto_savings = GoalAutoSaving.query.join(Goal).filter(
            Goal.status == 'ACTIVE',
            GoalAutoSaving.next_run_date <= today
        ).all()
        
        for auto_saving in auto_savings:
            try:
                process_goal_autopay(auto_saving, today)
            except Exception as e:
                db.session.rollback()
                print(f"Error processing goal autopay {auto_saving.id}: {str(e)}")

def start_scheduler(app):
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        func=execute_goal_autopay_job,
        args=[app],
        trigger='cron',
        hour=0,
        minute=0,
        id='goal_autopay_job'
    )
    scheduler.start()
