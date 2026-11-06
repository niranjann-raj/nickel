from app import create_app
from models import db
from models import User
from utils.security import hash_password

app = create_app()
with app.app_context():
    user = User.query.filter_by(email='rajaayu2005@gmail.com').first()
    if user:
        user.password_hash = hash_password('Nr@2005')
        db.session.commit()
        print("User password updated!")
    else:
        user = User(email='rajaayu2005@gmail.com', password_hash=hash_password('Nr@2005'), first_name='Test', last_name='User')
        db.session.add(user)
        db.session.commit()
        print("User created!")
