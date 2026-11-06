from app import create_app
from models import db, User, TrackerTransaction, Goal, GoalAutoSaving
from utils.security import hash_password
from datetime import date
from decimal import Decimal

app = create_app()

def seed_tracker_user():
    email = "tracker_test@example.com"
    with app.app_context():
        user = User.query.filter_by(email=email).first()
        if not user:
            try:
                user = User(
                    full_name="Tracker Test User",
                    email=email,
                    password_hash=hash_password("password123"),
                    is_verified=True
                )
                db.session.add(user)
                db.session.commit()
            except Exception:
                db.session.rollback()
                user = User.query.filter_by(email=email).first()

        if user:
            user.password_hash = hash_password("password123")
            user.is_verified = True
            db.session.commit()

            tx = TrackerTransaction.query.filter_by(user_id=user.id, merchant="Sunrise Foods Pvt Ltd").first()
            if not tx:
                tx = TrackerTransaction(
                    user_id=user.id,
                    type="EXPENSE",
                    amount=Decimal("3130.00"),
                    currency="INR",
                    category_name="Food & Dining",
                    merchant="Sunrise Foods Pvt Ltd",
                    transaction_date=date(2026, 7, 25),
                    payment_method="Card",
                    description="Playwright test bill for Sunrise Foods",
                    tags="dining,food"
                )
                db.session.add(tx)
                db.session.commit()

            # Ensure a sample goal exists with AutoPay
            existing_goal = Goal.query.filter_by(user_id=user.id).first()
            if not existing_goal:
                sample_goal = Goal(
                    user_id=user.id,
                    name="MacBook Pro",
                    description="Gadgets goal",
                    icon="💻",
                    target_amount=80000,
                    saved_amount=15000,
                    target_date=date(2028, 12, 31),
                    original_completion_date=date(2028, 12, 31),
                    current_completion_date=date(2028, 12, 31),
                    status="ACTIVE",
                    reward_awarded=False
                )
                db.session.add(sample_goal)
                db.session.flush()

                auto_saving = GoalAutoSaving(
                    goal_id=sample_goal.id,
                    amount=500,
                    frequency="WEEKLY",
                    next_run_date=date(2028, 12, 31)
                )
                db.session.add(auto_saving)
                db.session.commit()

        # Also seed a dedicated user for forgot password testing so tracker_test is never modified
        forgot_email = "forgot_test@example.com"
        forgot_user = User.query.filter_by(email=forgot_email).first()
        if not forgot_user:
            try:
                forgot_user = User(
                    full_name="Forgot Password Test User",
                    email=forgot_email,
                    password_hash=hash_password("password123"),
                    is_verified=True
                )
                db.session.add(forgot_user)
                db.session.commit()
            except Exception:
                db.session.rollback()
                forgot_user = User.query.filter_by(email=forgot_email).first()
        if forgot_user:
            forgot_user.password_hash = hash_password("password123")
            forgot_user.is_verified = True
            db.session.commit()

        print("Tracker test user, transaction & goal seeded successfully.")

if __name__ == '__main__':
    seed_tracker_user()
