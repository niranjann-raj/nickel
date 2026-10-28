from datetime import datetime, timezone, date
from flask_sqlalchemy import SQLAlchemy
from utils.security import EncryptedString, EncryptedFloat

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
    google_id = db.Column(db.String(255), unique=True, nullable=True)
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
    phone = db.Column(EncryptedString(255), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    streak_shields = db.Column(db.Integer, default=0)
    unlocked_avatars = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        n = self.level - 1
        xp_start_of_level = (n * (2000 + (n - 1) * 500)) // 2 if n > 0 else 0
        current_level_progress = self.lifetime_xp - xp_start_of_level
        if current_level_progress < 0:
            current_level_progress = 0
            
        goals_saved = 0.0
        wallet_balance = 0.0
        try:
            from models import Goal, SavingsWallet
            goals_saved = db.session.query(db.func.sum(Goal.saved_amount)).filter(Goal.user_id == self.id).scalar() or 0.0
            wallet = SavingsWallet.query.filter_by(user_id=self.id).first()
            if wallet and wallet.balance is not None:
                wallet_balance = float(wallet.balance)
        except Exception:
            pass
            
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
            'total_saved': self.total_saved + goals_saved + wallet_balance,
            'age': self.age,
            'phone': self.phone,
            'city': self.city,
            'streak_shields': self.streak_shields,
            'unlocked_avatars': self.unlocked_avatars,
            'has_password': self.password_hash != '!GOOGLE_AUTH_NO_PASSWORD!',
        }

class DailySpin(db.Model):
    __tablename__ = 'daily_spins'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, default=lambda: date.today(), nullable=False)
    time = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    reward = db.Column(db.String(255), nullable=False)
    reward_type = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
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
    balance = db.Column(EncryptedFloat, default=0.0)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(10), nullable=False)  # CREDIT or DEBIT
    amount = db.Column(EncryptedFloat, nullable=False)
    description = db.Column(EncryptedString(255))
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
    manual_pauses = db.Column(db.Integer, default=0)

class SavingsWallet(db.Model):
    __tablename__ = 'savings_wallet'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    balance = db.Column(EncryptedFloat, default=0.0)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Goal(db.Model):
    __tablename__ = 'goals'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    target_amount = db.Column(db.Float, nullable=False)
    saved_amount = db.Column(db.Float, default=0.0)
    target_date = db.Column(db.Date, nullable=False)
    icon = db.Column(db.String(255), nullable=True) # predefined image or icon name
    status = db.Column(db.String(20), default='ACTIVE') # ACTIVE, COMPLETED, PAUSED
    original_completion_date = db.Column(db.Date, nullable=False)
    current_completion_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'target_amount': self.target_amount,
            'saved_amount': self.saved_amount,
            'target_date': self.target_date.isoformat() if self.target_date else None,
            'icon': self.icon,
            'status': self.status,
            'original_completion_date': self.original_completion_date.isoformat() if self.original_completion_date else None,
            'current_completion_date': self.current_completion_date.isoformat() if self.current_completion_date else None,
            'created_at': self.created_at.isoformat()
        }

class GoalAutoSaving(db.Model):
    __tablename__ = 'goal_auto_saving'
    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goals.id'), nullable=False)
    frequency = db.Column(db.String(20), nullable=False) # DAILY, WEEKLY, MONTHLY, CUSTOM
    custom_days = db.Column(db.Integer, nullable=True) # if CUSTOM
    amount = db.Column(db.Float, nullable=False)
    next_run_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'goal_id': self.goal_id,
            'frequency': self.frequency,
            'custom_days': self.custom_days,
            'amount': self.amount,
            'next_run_date': self.next_run_date.isoformat() if self.next_run_date else None
        }

class GoalTransaction(db.Model):
    __tablename__ = 'goal_transactions'
    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goals.id'), nullable=False)
    type = db.Column(db.String(20), nullable=False) # CREDIT, DEBIT, SPLURGE, GOAL_AUTOPAY
    amount = db.Column(EncryptedFloat, nullable=False)
    description = db.Column(EncryptedString(255), nullable=True)
    
    # New fields for Goal Autopay
    status = db.Column(db.String(20), default='SUCCESS') # SUCCESS, FAILED
    source = db.Column(db.String(100), default='Dummy Bank')
    destination = db.Column(db.String(100), default='Goal Wallet')
    reason = db.Column(db.String(255), nullable=True)
    remaining_balance = db.Column(db.Float, nullable=True)
    current_balance = db.Column(db.Float, nullable=True)
    
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'goal_id': self.goal_id,
            'type': self.type,
            'amount': self.amount,
            'description': self.description,
            'status': self.status,
            'source': self.source,
            'destination': self.destination,
            'reason': self.reason,
            'remaining_balance': self.remaining_balance,
            'current_balance': self.current_balance,
            'created_at': self.created_at.isoformat()
        }

class GoalDelayHistory(db.Model):
    __tablename__ = 'goal_delay_history'
    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goals.id'), nullable=False)
    purchase_name = db.Column(db.String(255), nullable=False)
    purchase_amount = db.Column(db.Float, nullable=False)
    delay_days = db.Column(db.Integer, nullable=False)
    previous_completion_date = db.Column(db.Date, nullable=False)
    new_completion_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'goal_id': self.goal_id,
            'purchase_name': self.purchase_name,
            'purchase_amount': self.purchase_amount,
            'delay_days': self.delay_days,
            'previous_completion_date': self.previous_completion_date.isoformat() if self.previous_completion_date else None,
            'new_completion_date': self.new_completion_date.isoformat() if self.new_completion_date else None,
            'created_at': self.created_at.isoformat()
        }


# =============================================================================
# Money Tracker Models (Logically isolated from wallet & AutoPay models)
# =============================================================================

class TrackerCategory(db.Model):
    __tablename__ = 'tracker_categories'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True, index=True)
    name = db.Column(db.String(100), nullable=False)
    icon = db.Column(db.String(50), nullable=True)
    color = db.Column(db.String(50), nullable=True)
    type = db.Column(db.String(20), default='EXPENSE')  # EXPENSE | INCOME | BOTH
    is_system = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'icon': self.icon or 'Tag',
            'color': self.color or '#888888',
            'type': self.type,
            'is_system': self.is_system,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class BillUpload(db.Model):
    __tablename__ = 'bill_uploads'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    original_filename = db.Column(db.String(255), nullable=False)
    stored_filename = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)
    mime_type = db.Column(db.String(100), nullable=False)
    file_hash = db.Column(db.String(64), nullable=False, index=True)  # SHA-256
    status = db.Column(db.String(30), default='PENDING')  # PENDING, EXTRACTED, CONFIRMED, FAILED
    extracted_data = db.Column(db.Text, nullable=True)  # JSON payload of OCR extracted data
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        import json
        parsed_data = None
        if self.extracted_data:
            try:
                parsed_data = json.loads(self.extracted_data)
            except Exception:
                parsed_data = None

        return {
            'id': self.id,
            'user_id': self.user_id,
            'original_filename': self.original_filename,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'status': self.status,
            'extracted_data': parsed_data,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class TrackerTransaction(db.Model):
    __tablename__ = 'tracker_transactions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    type = db.Column(db.String(20), nullable=False)  # EXPENSE | INCOME
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    currency = db.Column(db.String(10), default='INR', nullable=False)
    category_name = db.Column(db.String(100), nullable=False, index=True)
    merchant = db.Column(db.String(255), nullable=True, index=True)
    transaction_date = db.Column(db.Date, nullable=False, index=True)
    payment_method = db.Column(db.String(50), nullable=True)  # UPI, Card, Net Banking, Cash, Other
    description = db.Column(db.Text, nullable=True)
    tags = db.Column(db.String(255), nullable=True)
    receipt_filename = db.Column(db.String(255), nullable=True)
    bill_upload_id = db.Column(db.Integer, db.ForeignKey('bill_uploads.id', ondelete='SET NULL'), nullable=True)
    is_subscription = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'amount': float(self.amount) if self.amount is not None else 0.0,
            'currency': self.currency,
            'category_name': self.category_name,
            'merchant': self.merchant or '',
            'transaction_date': self.transaction_date.isoformat() if self.transaction_date else None,
            'payment_method': self.payment_method or '',
            'description': self.description or '',
            'tags': [t.strip() for t in self.tags.split(',') if t.strip()] if self.tags else [],
            'receipt_filename': self.receipt_filename,
            'bill_upload_id': self.bill_upload_id,
            'is_subscription': self.is_subscription,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class TrackerSubscription(db.Model):
    __tablename__ = 'tracker_subscriptions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    category_name = db.Column(db.String(100), nullable=True)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    currency = db.Column(db.String(10), default='INR', nullable=False)
    billing_cycle = db.Column(db.String(20), default='MONTHLY', nullable=False)  # MONTHLY | YEARLY | QUARTERLY | WEEKLY
    next_renewal_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(20), default='ACTIVE', nullable=False)  # ACTIVE | PAUSED | CANCELLED
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'category_name': self.category_name or 'Subscriptions',
            'amount': float(self.amount) if self.amount is not None else 0.0,
            'currency': self.currency,
            'billing_cycle': self.billing_cycle,
            'next_renewal_date': self.next_renewal_date.isoformat() if self.next_renewal_date else None,
            'status': self.status,
            'notes': self.notes or '',
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class CategoryBudget(db.Model):
    __tablename__ = 'category_budgets'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    category_name = db.Column(db.String(100), nullable=False)
    month = db.Column(db.String(7), nullable=False)  # YYYY-MM
    budget_amount = db.Column(db.Numeric(12, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'category_name': self.category_name,
            'month': self.month,
            'budget_amount': float(self.budget_amount) if self.budget_amount is not None else 0.0,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# =============================================================================
# Split Expense Models
# =============================================================================

class SplitRoom(db.Model):
    __tablename__ = 'split_rooms'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(6), unique=True, nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    currency = db.Column(db.String(10), default='INR', nullable=False)
    icon = db.Column(db.String(50), default='Users', nullable=True)
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    is_settled = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    members = db.relationship('SplitMember', backref='room', cascade='all, delete-orphan', lazy=True)
    expenses = db.relationship('SplitExpense', backref='room', cascade='all, delete-orphan', lazy=True)
    settlement_payments = db.relationship('SplitSettlementPayment', backref='room', cascade='all, delete-orphan', lazy=True)
    activities = db.relationship('SplitActivity', backref='room', cascade='all, delete-orphan', lazy=True)

    def to_dict(self, current_user_id=None):
        user_role = None
        if current_user_id:
            membership = next((m for m in self.members if m.user_id == current_user_id), None)
            if membership:
                user_role = membership.role

        valid_expenses = [e for e in self.expenses if not e.is_deleted]
        total_spent = sum(float(e.amount) for e in valid_expenses if e.amount is not None)

        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'description': self.description or '',
            'currency': self.currency,
            'icon': self.icon or 'Users',
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'created_by': self.created_by,
            'is_settled': self.is_settled,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'member_count': len(self.members),
            'total_spent': round(total_spent, 2),
            'user_role': user_role,
        }


class SplitMember(db.Model):
    __tablename__ = 'split_members'
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('split_rooms.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    role = db.Column(db.String(20), default='member', nullable=False)  # 'owner' or 'member'
    joined_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.UniqueConstraint('room_id', 'user_id', name='uq_split_room_user'),
    )

    user = db.relationship('User', lazy='joined')

    def to_dict(self):
        return {
            'id': self.id,
            'room_id': self.room_id,
            'user_id': self.user_id,
            'role': self.role,
            'joined_at': self.joined_at.isoformat() if self.joined_at else None,
            'user': {
                'id': self.user.id if self.user else self.user_id,
                'full_name': self.user.full_name if self.user else f'User #{self.user_id}',
                'email': self.user.email if self.user else '',
                'avatar': self.user.avatar if (self.user and self.user.avatar) else '/game_avatar.png',
            }
        }


class SplitExpense(db.Model):
    __tablename__ = 'split_expenses'
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('split_rooms.id', ondelete='CASCADE'), nullable=False, index=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    category = db.Column(db.String(100), default='Other', nullable=False)
    expense_date = db.Column(db.Date, default=lambda: date.today(), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    split_method = db.Column(db.String(30), default='EQUAL', nullable=False)  # EQUAL, EXACT, PERCENTAGE, SHARES
    is_deleted = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    payers = db.relationship('SplitExpensePayer', backref='expense', cascade='all, delete-orphan', lazy=True)
    shares = db.relationship('SplitExpenseShare', backref='expense', cascade='all, delete-orphan', lazy=True)
    creator = db.relationship('User', foreign_keys=[created_by], lazy='joined')

    def to_dict(self):
        return {
            'id': self.id,
            'room_id': self.room_id,
            'title': self.title,
            'amount': float(self.amount) if self.amount is not None else 0.0,
            'category': self.category,
            'expense_date': self.expense_date.isoformat() if self.expense_date else None,
            'notes': self.notes or '',
            'split_method': self.split_method,
            'created_by': self.created_by,
            'creator': {
                'id': self.creator.id if self.creator else self.created_by,
                'full_name': self.creator.full_name if self.creator else f'User #{self.created_by}',
                'avatar': self.creator.avatar if (self.creator and self.creator.avatar) else '/game_avatar.png',
            },
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'payers': [p.to_dict() for p in self.payers],
            'shares': [s.to_dict() for s in self.shares],
        }


class SplitExpensePayer(db.Model):
    __tablename__ = 'split_expense_payers'
    id = db.Column(db.Integer, primary_key=True)
    expense_id = db.Column(db.Integer, db.ForeignKey('split_expenses.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    amount_paid = db.Column(db.Numeric(12, 2), nullable=False)

    user = db.relationship('User', lazy='joined')

    def to_dict(self):
        return {
            'id': self.id,
            'expense_id': self.expense_id,
            'user_id': self.user_id,
            'amount_paid': float(self.amount_paid) if self.amount_paid is not None else 0.0,
            'user_name': self.user.full_name if self.user else f'User #{self.user_id}',
            'user_avatar': self.user.avatar if (self.user and self.user.avatar) else '/game_avatar.png',
        }


class SplitExpenseShare(db.Model):
    __tablename__ = 'split_expense_shares'
    id = db.Column(db.Integer, primary_key=True)
    expense_id = db.Column(db.Integer, db.ForeignKey('split_expenses.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    share_amount = db.Column(db.Numeric(12, 2), nullable=False)
    raw_value = db.Column(db.Numeric(12, 4), nullable=True)

    user = db.relationship('User', lazy='joined')

    def to_dict(self):
        return {
            'id': self.id,
            'expense_id': self.expense_id,
            'user_id': self.user_id,
            'share_amount': float(self.share_amount) if self.share_amount is not None else 0.0,
            'raw_value': float(self.raw_value) if self.raw_value is not None else None,
            'user_name': self.user.full_name if self.user else f'User #{self.user_id}',
            'user_avatar': self.user.avatar if (self.user and self.user.avatar) else '/game_avatar.png',
        }


class SplitSettlementPayment(db.Model):
    __tablename__ = 'split_settlement_payments'
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('split_rooms.id', ondelete='CASCADE'), nullable=False, index=True)
    payer_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    status = db.Column(db.String(20), default='REPORTED', nullable=False)  # REPORTED | CONFIRMED | DISPUTED
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    confirmed_at = db.Column(db.DateTime, nullable=True)

    payer = db.relationship('User', foreign_keys=[payer_id], lazy='joined')
    recipient = db.relationship('User', foreign_keys=[recipient_id], lazy='joined')
    creator = db.relationship('User', foreign_keys=[created_by], lazy='joined')

    def to_dict(self):
        return {
            'id': self.id,
            'room_id': self.room_id,
            'payer_id': self.payer_id,
            'recipient_id': self.recipient_id,
            'created_by': self.created_by,
            'amount': float(self.amount) if self.amount is not None else 0.0,
            'status': self.status,
            'notes': self.notes or '',
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'confirmed_at': self.confirmed_at.isoformat() if self.confirmed_at else None,
            'payer': {
                'id': self.payer_id,
                'full_name': self.payer.full_name if self.payer else f'User #{self.payer_id}',
                'avatar': self.payer.avatar if (self.payer and self.payer.avatar) else '/game_avatar.png',
            },
            'recipient': {
                'id': self.recipient_id,
                'full_name': self.recipient.full_name if self.recipient else f'User #{self.recipient_id}',
                'avatar': self.recipient.avatar if (self.recipient and self.recipient.avatar) else '/game_avatar.png',
            },
            'creator': {
                'id': self.created_by,
                'full_name': self.creator.full_name if self.creator else f'User #{self.created_by}',
                'avatar': self.creator.avatar if (self.creator and self.creator.avatar) else '/game_avatar.png',
            }
        }


class SplitActivity(db.Model):
    __tablename__ = 'split_activities'
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('split_rooms.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    activity_type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    metadata_json = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', lazy='joined')

    def to_dict(self):
        return {
            'id': self.id,
            'room_id': self.room_id,
            'user_id': self.user_id,
            'activity_type': self.activity_type,
            'description': self.description,
            'metadata_json': self.metadata_json,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user': {
                'id': self.user.id if self.user else self.user_id,
                'full_name': self.user.full_name if self.user else f'User #{self.user_id}',
                'avatar': self.user.avatar if (self.user and self.user.avatar) else '/game_avatar.png',
            } if self.user_id else None
        }



