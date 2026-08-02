from apscheduler.schedulers.background import BackgroundScheduler
from models import db, User, BankAccount, Transaction, Autopay, SavingsWallet
from routes.dashboard import level_up
from datetime import date

XP_REWARDS = {
    'EASY': 100,
    'MEDIUM': 200,
    'HARD': 300
}

def fail_cycle(cycle, user, reason="Failed"):
    cycle.status = 'FAILED'
    user.current_streak = 0
    print(f"Cycle {cycle.id} for User {user.id} FAILED: {reason}")
    db.session.commit()

def complete_cycle(cycle, user):
    cycle.status = 'COMPLETED'
    xp_earned = XP_REWARDS.get(cycle.level, 0)
    user.xp += xp_earned
    user.lifetime_xp += xp_earned
    
    tx = Transaction(
        user_id=user.id,
        type='CREDIT',
        amount=0,
        description=f"Earned {xp_earned} XP for completing Autopay Cycle #{cycle.id}"
    )
    db.session.add(tx)
    db.session.commit()

def process_single_autopay(cycle, today):
    user = User.query.get(cycle.user_id)
    bank = BankAccount.query.filter_by(user_id=user.id).first()
    wallet = SavingsWallet.query.filter_by(user_id=user.id).first()
    
    if not wallet:
        wallet = SavingsWallet(user_id=user.id, balance=0.0)
        db.session.add(wallet)
        db.session.commit()

    deduction = cycle.daily_deduction
    if cycle.current_day == 29:
        deduction = round(cycle.target_amount - (cycle.daily_deduction * 29), 2)
        
    has_funds = bank is not None and bank.balance >= deduction

    # Handle USER_PAUSED gracefully (if they manually paused, we don't freeze countdown)
    if cycle.status == 'USER_PAUSED':
        cycle.last_run_date = today
        db.session.commit()
        return

    if cycle.status == 'PAUSED':
        if has_funds:
            # They added money during the freeze! Auto-resume
            cycle.status = 'ACTIVE'
            cycle.freeze_days_left = 3 if cycle.level == 'EASY' else (1 if cycle.level == 'MEDIUM' else 0)
        else:
            if cycle.freeze_days_left > 0:
                cycle.freeze_days_left -= 1
                cycle.last_run_date = today
                db.session.commit()
                return
            else:
                fail_cycle(cycle, user, reason="Freeze grace period expired")
                return

    if cycle.status == 'ACTIVE':
        if has_funds:
            bank.balance -= deduction
            wallet.balance += deduction
            tx = Transaction(
                user_id=user.id,
                type='DEBIT',
                amount=deduction,
                description=f"Autopay Cycle #{cycle.id} - Day {cycle.current_day + 1}"
            )
            db.session.add(tx)
            
            cycle.current_day += 1
            user.current_streak += 1
            
            # ── Daily XP ──
            daily_xp = 50
            user.xp += daily_xp
            user.lifetime_xp += daily_xp
            
            try:
                level_up(user)
            except Exception as e:
                print(f"level_up error: {e}")
            
            # Replenish freeze days on success
            cycle.freeze_days_left = 3 if cycle.level == 'EASY' else (1 if cycle.level == 'MEDIUM' else 0)
            
            cycle.last_run_date = today
            db.session.commit()
            print(f"[Autopay] Day {cycle.current_day}/30 done. User {user.id} got +{daily_xp} XP. lifetime_xp={user.lifetime_xp}")
            
            if cycle.current_day >= 30:
                complete_cycle(cycle, user)
        else:
            if cycle.level == 'HARD':
                fail_cycle(cycle, user, reason="Insufficient funds (Hard Mode)")
            else:
                if cycle.freeze_days_left > 0:
                    cycle.status = 'PAUSED'
                    cycle.freeze_days_left -= 1
                    cycle.last_run_date = today
                    db.session.commit()
                else:
                    fail_cycle(cycle, user, reason="Insufficient funds and no freeze days left")


def execute_daily_autopay_job(app):
    with app.app_context():
        today = date.today()
        cycles_to_process = Autopay.query.filter(
            Autopay.status.in_(['ACTIVE', 'PAUSED'])
        ).all()
        
        for cycle in cycles_to_process:
            try:
                if cycle.last_run_date == today:
                    continue
                process_single_autopay(cycle, today)
            except Exception as e:
                db.session.rollback()
                print(f"Error processing cycle {cycle.id}: {str(e)}")

def start_scheduler(app):
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        func=execute_daily_autopay_job,
        args=[app],
        trigger='cron',
        hour=0,
        minute=0,
        id='daily_autopay_job'
    )
    scheduler.start()
