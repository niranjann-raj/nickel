from app import create_app
from models import (
    db, User, TrackerTransaction, BillUpload, TrackerCategory, 
    TrackerSubscription, CategoryBudget, Goal, GoalAutoSaving, 
    GoalTransaction, GoalDelayHistory, DailySpin, Saving, 
    QuizAttempt, Notification, BankAccount, Transaction, 
    Autopay, SavingsWallet, OtpToken
)

app = create_app()

def delete_tracker_test_user():
    with app.app_context():
        users = User.query.filter(
            (User.email == "tracker_test@example.com") | (User.full_name == "Tracker Test User")
        ).all()
        
        if not users:
            print("No tracker test user found.")
            return

        for user in users:
            print(f"Deleting user: id={user.id}, name={user.full_name}, email={user.email}")
            user_goals = Goal.query.filter_by(user_id=user.id).all()
            goal_ids = [g.id for g in user_goals]
            if goal_ids:
                GoalAutoSaving.query.filter(GoalAutoSaving.goal_id.in_(goal_ids)).delete(synchronize_session=False)
                GoalTransaction.query.filter(GoalTransaction.goal_id.in_(goal_ids)).delete(synchronize_session=False)
                GoalDelayHistory.query.filter(GoalDelayHistory.goal_id.in_(goal_ids)).delete(synchronize_session=False)
            Goal.query.filter_by(user_id=user.id).delete(synchronize_session=False)

            TrackerTransaction.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            BillUpload.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            TrackerCategory.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            TrackerSubscription.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            CategoryBudget.query.filter_by(user_id=user.id).delete(synchronize_session=False)

            DailySpin.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            Saving.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            QuizAttempt.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            Notification.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            BankAccount.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            Transaction.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            Autopay.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            SavingsWallet.query.filter_by(user_id=user.id).delete(synchronize_session=False)
            OtpToken.query.filter_by(email=user.email).delete(synchronize_session=False)

            db.session.delete(user)
            db.session.commit()
            print(f"User {user.id} ({user.email}) deleted successfully.")

if __name__ == '__main__':
    delete_tracker_test_user()
