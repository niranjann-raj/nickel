from app import create_app
from models import db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        db.session.execute(text('ALTER TABLE autopay ADD COLUMN manual_pauses INTEGER DEFAULT 0;'))
        db.session.commit()
        print("Success")
    except Exception as e:
        print("Error:", e)
