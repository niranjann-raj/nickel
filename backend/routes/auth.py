import os
import random
import re
from datetime import datetime, timezone, timedelta

from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from models import db, User, OtpToken
from utils.email import send_otp_email

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

EMAIL_REGEX = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')


def generate_otp() -> str:
    return str(random.randint(100000, 999999))


def store_otp(email: str, purpose: str) -> str:
    # Invalidate old OTPs for same email + purpose
    OtpToken.query.filter_by(email=email, purpose=purpose, used=False).update({'used': True})
    db.session.flush()
    otp = generate_otp()
    token = OtpToken(
        email=email,
        otp_code=otp,
        purpose=purpose,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
    )
    db.session.add(token)
    db.session.commit()
    return otp


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    full_name = (data.get('full_name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not full_name:
        return jsonify({'error': 'Full name is required.'}), 400
    if not EMAIL_REGEX.match(email):
        return jsonify({'error': 'Invalid email address.'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters.'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'An account with this email already exists.'}), 409

    pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(full_name=full_name, email=email, password_hash=pw_hash)
    db.session.add(user)
    db.session.commit()

    otp = store_otp(email, 'register')
    try:
        send_otp_email(email, otp, 'register')
    except Exception as e:
        return jsonify({'error': f'Failed to send OTP email: {str(e)}'}), 500

    return jsonify({'message': 'OTP sent to your email.'}), 201


@auth_bp.route('/resend-otp', methods=['POST'])
def resend_otp():
    data = request.get_json()
    email = (data.get('email') or '').strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'No account with that email.'}), 404
    otp = store_otp(email, 'register')
    try:
        send_otp_email(email, otp, 'register')
    except Exception as e:
        return jsonify({'error': f'Failed to send OTP: {str(e)}'}), 500
    return jsonify({'message': 'OTP resent.'}), 200


@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email = (data.get('email') or '').strip().lower()
    otp_code = str(data.get('otp') or '').strip()
    mode = data.get('mode', 'register')  # 'register' | 'reset'

    purpose = 'register' if mode == 'register' else 'reset'
    record = OtpToken.query.filter_by(email=email, otp_code=otp_code, purpose=purpose, used=False).first()

    if not record:
        return jsonify({'error': 'Invalid OTP. Please try again.'}), 400

    now = datetime.now(timezone.utc)
    expires = record.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if now > expires:
        record.used = True
        db.session.commit()
        return jsonify({'error': 'OTP has expired. Please request a new one.'}), 400

    record.used = True
    db.session.commit()

    if mode == 'register':
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'error': 'Account not found.'}), 404
        user.is_verified = True
        db.session.commit()
        token = create_access_token(identity=str(user.id))
        return jsonify({'token': token, 'user': user.to_dict()}), 200

    # For reset mode, just confirm OTP is valid, frontend moves to reset-password
    return jsonify({'message': 'OTP verified.'}), 200


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Incorrect email or password.'}), 401

    if not user.is_verified:
        return jsonify({'error': 'Please verify your email before logging in.'}), 403

    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'user': user.to_dict()}), 200


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = (data.get('email') or '').strip().lower()

    user = User.query.filter_by(email=email).first()
    if not user:
        # Return success regardless to prevent email enumeration
        return jsonify({'message': 'If that email is registered, a code has been sent.'}), 200

    otp = store_otp(email, 'reset')
    try:
        send_otp_email(email, otp, 'reset')
    except Exception as e:
        return jsonify({'error': f'Failed to send reset email: {str(e)}'}), 500

    return jsonify({'message': 'Reset OTP sent to your email.'}), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = (data.get('email') or '').strip().lower()
    otp_code = str(data.get('otp') or '').strip()
    new_password = data.get('new_password') or ''

    if len(new_password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters.'}), 400

    # Re-verify OTP (it was already marked used in verify-otp, so allow re-use here by finding the most recent used one)
    record = OtpToken.query.filter_by(email=email, otp_code=otp_code, purpose='reset').order_by(OtpToken.created_at.desc()).first()
    if not record:
        return jsonify({'error': 'Invalid or expired reset code.'}), 400

    now = datetime.now(timezone.utc)
    expires = record.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if now > expires:
        return jsonify({'error': 'Reset code has expired.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Account not found.'}), 404

    user.password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    db.session.commit()

    return jsonify({'message': 'Password updated successfully.'}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({'error': 'User not found.'}), 404
    return jsonify(user.to_dict()), 200
