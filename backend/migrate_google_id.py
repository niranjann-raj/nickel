from app import create_app
from models import db
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        db.session.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;"))
        db.session.commit()
        print("Successfully added google_id column to users table.")
    except Exception as e:
        db.session.rollback()
        print(f"Migration error (column might already exist): {e}")
