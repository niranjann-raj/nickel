from app import create_app
from models import db, User, TrackerTransaction
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
        print("Tracker test user & transaction seeded successfully.")

if __name__ == '__main__':
    seed_tracker_user()
