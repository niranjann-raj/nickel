from app import create_app
from utils.ai_context import build_nickel_context
from models import User

app = create_app()

with app.app_context():
    user = User.query.first()
    if user:
        try:
            ctx = build_nickel_context(user.id)
            print("SUCCESS")
            print(ctx)
        except Exception as e:
            print(f"ERROR: {e}")
    else:
        print("No users found.")
