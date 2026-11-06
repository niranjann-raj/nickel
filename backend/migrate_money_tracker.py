import os
from dotenv import load_dotenv
load_dotenv()

from app import create_app
from models import db, TrackerCategory

DEFAULT_SYSTEM_CATEGORIES = [
    {"name": "Food & Dining", "icon": "Utensils", "color": "#f97316", "type": "EXPENSE"},
    {"name": "Groceries", "icon": "ShoppingCart", "color": "#22c55e", "type": "EXPENSE"},
    {"name": "Transportation", "icon": "Car", "color": "#06b6d4", "type": "EXPENSE"},
    {"name": "Shopping", "icon": "ShoppingBag", "color": "#ec4899", "type": "EXPENSE"},
    {"name": "Entertainment", "icon": "Film", "color": "#a855f7", "type": "EXPENSE"},
    {"name": "Bills & Utilities", "icon": "Zap", "color": "#eab308", "type": "EXPENSE"},
    {"name": "Rent & Housing", "icon": "Home", "color": "#3b82f6", "type": "EXPENSE"},
    {"name": "Healthcare", "icon": "HeartPulse", "color": "#ef4444", "type": "EXPENSE"},
    {"name": "Education", "icon": "GraduationCap", "color": "#6366f1", "type": "EXPENSE"},
    {"name": "Travel", "icon": "Plane", "color": "#14b8a6", "type": "EXPENSE"},
    {"name": "Personal Care", "icon": "Smile", "color": "#f43f5e", "type": "EXPENSE"},
    {"name": "Subscriptions", "icon": "RotateCcw", "color": "#8b5cf6", "type": "EXPENSE"},
    {"name": "Investments", "icon": "TrendingUp", "color": "#10b981", "type": "EXPENSE"},
    {"name": "Savings", "icon": "PiggyBank", "color": "#34d399", "type": "EXPENSE"},
    {"name": "Salary & Income", "icon": "Banknote", "color": "#10b981", "type": "INCOME"},
    {"name": "Other", "icon": "MoreHorizontal", "color": "#94a3b8", "type": "EXPENSE"},
]

def run_migration():
    app = create_app()
    with app.app_context():
        # db.create_all() creates any new tables that do not yet exist
        db.create_all()
        print("Ensured all database tables exist.")

        # Seed system categories if not already present
        existing = {cat.name for cat in TrackerCategory.query.filter_by(is_system=True).all()}
        added = 0
        for item in DEFAULT_SYSTEM_CATEGORIES:
            if item["name"] not in existing:
                category = TrackerCategory(
                    user_id=None,
                    name=item["name"],
                    icon=item["icon"],
                    color=item["color"],
                    type=item["type"],
                    is_system=True
                )
                db.session.add(category)
                added += 1

        if added > 0:
            db.session.commit()
            print(f"Seeded {added} default system categories.")
        else:
            print("System categories already seeded.")

if __name__ == '__main__':
    run_migration()
