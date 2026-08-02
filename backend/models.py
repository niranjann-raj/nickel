from datetime import datetime, timezone, date
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def xp_for_level(level: int) -> int:
    """XP required to reach next level: base 1000, +500 per level."""
    return 1000 + (level - 1) * 500


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    avatar = db.Column(db.String(500), default='/game_avatar.png')
    # Gamification
    xp = db.Column(db.Integer, default=0)
    lifetime_xp = db.Column(db.Integer, default=0)
    level = db.Column(db.Integer, default=1)
    coins = db.Column(db.Integer, default=0)
    current_streak = db.Column(db.Integer, default=0)
    last_save_date = db.Column(db.Date, nullable=True)
    total_saved = db.Column(db.Float, default=0.0)
    # Extra profile fields
    age = db.Column(db.Integer, nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        n = self.level - 1
        xp_start_of_level = (n * (2000 + (n - 1) * 500)) // 2 if n > 0 else 0
        current_level_progress = self.lifetime_xp - xp_start_of_level
        if current_level_progress < 0:
            current_level_progress = 0
            
        return {
            'id': self.id,
            'full_name': self.full_name,
            'email': self.email,
            'is_verified': self.is_verified,
            'avatar': self.avatar or '/game_avatar.png',
            'xp': current_level_progress,
            'season_xp': self.xp,
            'lifetime_xp': self.lifetime_xp,
            'level': self.level,
            'xp_to_next_level': xp_for_level(self.level),
            'coins': self.coins,
            'current_streak': self.current_streak,
            'total_saved': self.total_saved,
            'age': self.age,
            'phone': self.phone,
            'city': self.city,
        }


class OtpToken(db.Model):
    __tablename__ = 'otp_tokens'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(200), nullable=False)
    otp_code = db.Column(db.String(6), nullable=False)
    purpose = db.Column(db.String(20), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


class Saving(db.Model):
    __tablename__ = 'savings'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount_entered = db.Column(db.Float, nullable=False)
    saving_level = db.Column(db.String(10), nullable=False)  # easy | medium | hard
    saved_amount = db.Column(db.Float, nullable=False)
    xp_earned = db.Column(db.Integer, default=0)
    streak_bonus_xp = db.Column(db.Integer, default=0)
    date = db.Column(db.Date, default=lambda: date.today())
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


class Quiz(db.Model):
    __tablename__ = 'quiz_questions'
    id = db.Column(db.Integer, primary_key=True)
    topic = db.Column(db.String(50), nullable=False)
    question = db.Column(db.Text, nullable=False)
    option_a = db.Column(db.String(200), nullable=False)
    option_b = db.Column(db.String(200), nullable=False)
    option_c = db.Column(db.String(200), nullable=False)
    option_d = db.Column(db.String(200), nullable=False)
    correct_answer = db.Column(db.String(1), nullable=False)  # a | b | c | d
    coin_reward = db.Column(db.Integer, default=20)
    explanation = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'topic': self.topic,
            'question': self.question,
            'option_a': self.option_a,
            'option_b': self.option_b,
            'option_c': self.option_c,
            'option_d': self.option_d,
        }


class QuizAttempt(db.Model):
    __tablename__ = 'quiz_attempts'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    coins_earned = db.Column(db.Integer, default=0)
    attempt_date = db.Column(db.Date, default=lambda: date.today())
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

class GlobalState(db.Model):
    __tablename__ = 'global_state'
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(255), unique=True, nullable=False)
    value = db.Column(db.String(255), nullable=False)

class Notification(db.Model):
    __tablename__ = 'notification'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text)
    type = db.Column(db.String(50))
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat()
        }

class BankAccount(db.Model):
    __tablename__ = 'bank_account'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    balance = db.Column(db.Float, default=0.0)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(10), nullable=False)  # CREDIT or DEBIT
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

class Autopay(db.Model):
    __tablename__ = 'autopay'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    level = db.Column(db.String(10), nullable=False)  # EASY, MEDIUM, HARD
    status = db.Column(db.String(20), default='ACTIVE')  # ACTIVE, PAUSED, USER_PAUSED, FAILED, COMPLETED
    target_amount = db.Column(db.Float, nullable=False)
    daily_deduction = db.Column(db.Float, nullable=False)
    current_day = db.Column(db.Integer, default=0)
    freeze_days_left = db.Column(db.Integer, default=0)
    cycle_start_date = db.Column(db.Date, default=lambda: date.today())
    last_run_date = db.Column(db.Date, nullable=True)

class SavingsWallet(db.Model):
    __tablename__ = 'savings_wallet'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    balance = db.Column(db.Float, default=0.0)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
