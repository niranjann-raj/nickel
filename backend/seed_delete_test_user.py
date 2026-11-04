import sys
from app import create_app
from models import (
    db, User, OtpToken, DailySpin, QuizAttempt, Notification,
    Goal, GoalAutoSaving, GoalTransaction, GoalDelayHistory,
    TrackerTransaction, BillUpload, TrackerCategory, TrackerSubscription, CategoryBudget,
    SplitMember, SplitExpensePayer, SplitExpenseShare, SplitExpense, SplitRoom, SplitActivity, SplitSettlementPayment
)
from utils.security import hash_password

app = create_app()

def seed_user():
    email = "delete_test@example.com"
    with app.app_context():
        user = User.query.filter_by(email=email).first()
        if user:
            # Pre-cleanup in case a previous test failed midway
            user_goals = Goal.query.filter_by(user_id=user.id).all()
            goal_ids = [g.id for g in user_goals]
            if goal_ids:
                GoalAutoSaving.query.filter(GoalAutoSaving.goal_id.in_(goal_ids)).delete(synchronize_session=False)
                GoalTransaction.query.filter(GoalTransaction.goal_id.in_(goal_ids)).delete(synchronize_session=False)
                GoalDelayHistory.query.filter(GoalDelayHistory.goal_id.in_(goal_ids)).delete(synchronize_session=False)
            Goal.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            DailySpin.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            QuizAttempt.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            Notification.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            TrackerTransaction.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            BillUpload.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            TrackerCategory.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            TrackerSubscription.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            CategoryBudget.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            SplitExpenseShare.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            SplitExpensePayer.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            SplitSettlementPayment.query.filter(
                (SplitSettlementPayment.payer_id == user.id) | (SplitSettlementPayment.recipient_id == user.id)
            ).delete(synchronize_session=False)
            SplitMember.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            SplitActivity.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            OtpToken.query.filter_by(email=email).delete(synchronize_session=False)
            db.session.delete(user)
            db.session.commit()
            
        user = User(
            full_name="Delete Test User",
            email=email,
            password_hash=hash_password("password123"),
            is_verified=True
        )
        db.session.add(user)

        google_email = "delete_google_test@example.com"
        google_user = User.query.filter_by(email=google_email).first()
        if google_user:
            db.session.delete(google_user)
            db.session.commit()
            
        google_user = User(
            full_name="Google Delete Test User",
            email=google_email,
            password_hash="!GOOGLE_AUTH_NO_PASSWORD!",
            google_id="test_google_delete_sub",
            is_verified=True
        )
        db.session.add(google_user)

        db.session.commit()
        print("Test users seeded successfully.")

if __name__ == '__main__':
    seed_user()
