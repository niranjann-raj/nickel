import os
from dotenv import load_dotenv

load_dotenv()

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from models import db
from routes.auth import auth_bp, bcrypt

def create_app():
    app = Flask(__name__)

    # Config
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'change_me')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # No expiry (simplicity); set timedelta for production

    # Extensions
    CORS(app, origins=['http://localhost:5173'], supports_credentials=True)
    db.init_app(app)
    bcrypt.init_app(app)
    JWTManager(app)

    # Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    # Create tables
    with app.app_context():
        db.create_all()

    return app


if __name__ == '__main__':
    app = create_app()
    print("🚀 nickle backend running on http://localhost:5000")
    app.run(debug=True, port=5000)
