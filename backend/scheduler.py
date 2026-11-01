from apscheduler.schedulers.background import BackgroundScheduler
from models import db, User, Goal, GoalAutoSaving, GoalTransaction, Notification
from routes.dashboard import level_up
from datetime import date

def get_user_account_balance(user_id):
    """
    Calculates cumulative Main Account Balance (Total Income - Total Expenses)
    from the Expense Tracker for the authenticated user across all tracked time.
    """
    from models import TrackerTransaction
    from sqlalchemy import func
    from decimal import Decimal

    inc = db.session.query(func.coalesce(func.sum(TrackerTransaction.amount), Decimal('0.00')))\
        .filter(
            TrackerTransaction.user_id == user_id,
            TrackerTransaction.type == 'INCOME'
        )\
        .scalar()

    exp = db.session.query(func.coalesce(func.sum(TrackerTransaction.amount), Decimal('0.00')))\
        .filter(
            TrackerTransaction.user_id == user_id,
            TrackerTransaction.type == 'EXPENSE'
        )\
        .scalar()

    net = Decimal(str(inc)) - Decimal(str(exp))
    return float(net)

def get_user_net_cash_flow(user_id, as_of_date=None, start_date=None, end_date=None):
    """
    If start_date and end_date are provided, computes net cash flow for that specific window.
    Otherwise, returns the user's Main Account Balance (cumulative net cash flow across all tracked time).
    """
    from models import TrackerTransaction
    from sqlalchemy import func
    from decimal import Decimal
    from datetime import date

    if start_date is None and end_date is None:
        return get_user_account_balance(user_id)

    today = as_of_date or date.today()
    start_date = start_date or today.replace(day=1)
    end_date = end_date or today

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

    # Linked directly to Main Account Balance (Cumulative all-time balance)
    account_balance = get_user_account_balance(user.id)

    if account_balance >= amount:
        # Success: Debit directly from Main Account Balance (logs an Expense in Tracker)
        tracker_tx = TrackerTransaction(
            user_id=user.id,
            type='EXPENSE',
            amount=Decimal(str(amount)),
            currency='INR',
            category_name='Savings',
            merchant=f"{goal.name} autopay debit",
            description=f"AutoPay debit for goal: {goal.name}",
            transaction_date=today,
            payment_method='AutoPay',
            tags='autopay,goal-savings',
            created_at=datetime.now(timezone.utc)
        )
        db.session.add(tracker_tx)

        # Credit to Goal
        goal.saved_amount += amount

        # Check completion and award Gold Coins based on target amount tier
        completion_coins = 0
        if goal.saved_amount >= goal.target_amount and goal.status != 'COMPLETED':
            goal.status = 'COMPLETED'
            goal.current_completion_date = today
            if not getattr(goal, 'reward_awarded', False):
                from models import calculate_goal_completion_coins
                completion_coins = calculate_goal_completion_coins(goal.target_amount)
                user.coins += completion_coins
                goal.reward_awarded = True

                notif = Notification(
                    user_id=user.id,
                    title="Goal Completed! 🏆",
                    message=f"Congratulations! You completed your goal '{goal.name}' (Target: ₹{goal.target_amount:,.2f}) and earned {completion_coins:,} Gold Coins!",
                    type="reward"
                )
                db.session.add(notif)
                print(f"[Goal Autopay] Goal {goal.id} completed! Awarded {completion_coins} Gold Coins to User {user.id}")

        tx = GoalTransaction(
            goal_id=goal.id,
            type='GOAL_AUTOPAY',
            amount=amount,
            status='SUCCESS',
            source='Main Account Balance',
            destination='Goal Wallet',
            description=f"AutoPay: Saved ₹{amount:,.2f} for {goal.name} from Main Account Balance",
            remaining_balance=max(0.0, goal.target_amount - goal.saved_amount),
            current_balance=goal.saved_amount
        )
        db.session.add(tx)

        # ── Streak and XP Logic for Goal-based Savings ──
        # Streak and 50 XP daily bonus ONLY work when autopay frequency is set to DAILY
        streak_maintained = False
        daily_streak_xp = 0

        if auto_saving.frequency == 'DAILY':
            # Reconcile any past missed days using shields
            user.get_active_streak()

            if user.last_save_date == today:
                streak_maintained = True
            elif user.last_save_date == today - timedelta(days=1):
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
            try:
                auto_saving.next_run_date = today + timedelta(days=int(auto_saving.custom_days))
            except (ValueError, TypeError):
                auto_saving.next_run_date = today + timedelta(days=1)
        else:
            auto_saving.next_run_date = today + timedelta(days=1)

        # In-app notification for the user
        streak_note = " 🔥 Daily Streak maintained! (+50 XP)" if (auto_saving.frequency == 'DAILY' and daily_streak_xp > 0) else ""
        notif = Notification(
            user_id=user.id,
            title='AutoPay Debited',
            message=f"Debited ₹{amount:,.2f} from Main Account Balance for '{goal.name}'.{streak_note}",
            type='success'
        )
        db.session.add(notif)

        db.session.commit()
        remaining_balance = account_balance - amount
        print(f"[Goal Autopay] Success for Goal {goal.id} - Debited INR {amount} from Main Account Balance. Streak: {user.current_streak}")

        completion_note = f" 🏆 Goal Completed! You earned {completion_coins:,} Gold Coins!" if completion_coins > 0 else ""
        if auto_saving.frequency == 'DAILY':
            if daily_streak_xp > 0:
                success_msg = f"AutoPay executed successfully! Debited ₹{amount:,.2f} from Main Account Balance. 🔥 Daily Streak: {user.current_streak} days (+{daily_streak_xp} XP earned!){completion_note}"
            else:
                success_msg = f"AutoPay executed successfully! Debited ₹{amount:,.2f} from Main Account Balance. 🔥 Daily Streak maintained for today ({user.current_streak} days).{completion_note}"
        else:
            success_msg = f"AutoPay executed successfully! Debited ₹{amount:,.2f} from Main Account Balance.{completion_note}"

        return True, success_msg, tx, remaining_balance
    else:
        # Failed: Insufficient funds in Main Account Balance
        goal.status = 'PAUSED'

        if auto_saving.frequency == 'DAILY':
            user.get_active_streak()

        reason = f"Insufficient funds in Main Account Balance (₹{account_balance:,.2f} available, ₹{amount:,.2f} required)"
        notif = Notification(
            user_id=user.id,
            title='AutoPay Paused',
            message=f"AutoPay for '{goal.name}' was paused due to insufficient Main Account Balance (₹{account_balance:,.2f} available, ₹{amount:,.2f} required).",
            type='warning'
        )
        db.session.add(notif)
        tx = GoalTransaction(
            goal_id=goal.id,
            type='GOAL_AUTOPAY',
            amount=amount,
            status='FAILED',
            source='Main Account Balance',
            destination='Goal Wallet',
            reason=reason,
            description=f"AutoPay Failed: Insufficient balance in Main Account Balance for {goal.name}",
            remaining_balance=max(0.0, goal.target_amount - goal.saved_amount),
            current_balance=goal.saved_amount
        )
        db.session.add(tx)
        db.session.commit()
        print(f"[Goal Autopay] Failed for Goal {goal.id} - Insufficient Balance in Main Account Balance")
        return False, reason, tx, account_balance

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
        hour=1,
        minute=0,
        id='goal_autopay_job'
    )
    scheduler.start()
