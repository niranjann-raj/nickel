import random
from datetime import datetime, timezone, date, timedelta

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db, User, Saving, Quiz, QuizAttempt, xp_for_level

dashboard_bp = Blueprint('dashboard', __name__)

# ─────────────────────────── helpers ───────────────────────────

STREAK_MILESTONES = {3: 50, 5: 100, 7: 150, 14: 300, 30: 700}

SAVING_CONFIG = {
    'easy':   {'pct': 0.20, 'xp': 100},
    'medium': {'pct': 0.30, 'xp': 200},
    'hard':   {'pct': 0.40, 'xp': 300},
}

def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))

def level_up(user: User):
    """Check and apply level-up(s)."""
    while user.xp >= xp_for_level(user.level):
        user.xp -= xp_for_level(user.level)
        user.level += 1


# ─────────────────────────── routes ────────────────────────────

@dashboard_bp.route('/user-profile', methods=['GET'])
@jwt_required()
def user_profile():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict()), 200


@dashboard_bp.route('/add-saving', methods=['POST'])
@jwt_required()
def add_saving():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    amount = float(data.get('amount', 0))
    level_key = str(data.get('level', 'easy')).lower()

    if amount <= 0:
        return jsonify({'error': 'Amount must be greater than 0'}), 400
    if level_key not in SAVING_CONFIG:
        return jsonify({'error': 'Invalid level. Use easy, medium, or hard'}), 400

    cfg = SAVING_CONFIG[level_key]
    saved = round(amount * cfg['pct'], 2)
    remaining = round(amount - saved, 2)
    xp_earned = cfg['xp']

    # ── Streak logic ──
    today = date.today()
    streak_bonus = 0
    if user.last_save_date is None:
        user.current_streak = 1
    elif user.last_save_date == today:
        # Already saved today → no streak change
        pass
    elif user.last_save_date == today - timedelta(days=1):
        user.current_streak += 1
    else:
        user.current_streak = 1  # streak broken

    user.last_save_date = today

    # Milestone bonus
    if user.current_streak in STREAK_MILESTONES:
        streak_bonus = STREAK_MILESTONES[user.current_streak]

    total_xp = xp_earned + streak_bonus
    user.xp += total_xp
    user.total_saved = round((user.total_saved or 0) + saved, 2)
    level_up(user)

    record = Saving(
        user_id=user.id,
        amount_entered=amount,
        saving_level=level_key,
        saved_amount=saved,
        xp_earned=xp_earned,
        streak_bonus_xp=streak_bonus,
    )
    db.session.add(record)
    db.session.commit()

    return jsonify({
        'saved_amount': saved,
        'remaining': remaining,
        'xp_earned': xp_earned,
        'streak_bonus_xp': streak_bonus,
        'current_streak': user.current_streak,
        'user': user.to_dict(),
    }), 200


@dashboard_bp.route('/streak', methods=['GET'])
@jwt_required()
def streak():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    next_milestone = next((m for m in sorted(STREAK_MILESTONES) if m > user.current_streak), None)
    return jsonify({
        'current_streak': user.current_streak,
        'last_save_date': str(user.last_save_date) if user.last_save_date else None,
        'next_milestone': next_milestone,
        'next_milestone_bonus': STREAK_MILESTONES.get(next_milestone, 0),
        'milestones': STREAK_MILESTONES,
    }), 200


@dashboard_bp.route('/weekly-quiz', methods=['GET'])
@jwt_required()
def weekly_quiz():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Check if already attempted this week
    week_start = date.today() - timedelta(days=date.today().weekday())
    attempt = QuizAttempt.query.filter(
        QuizAttempt.user_id == user.id,
        QuizAttempt.attempt_date >= week_start
    ).first()

    questions = Quiz.query.all()
    if not questions:
        return jsonify({'error': 'No quiz questions available yet', 'questions': []}), 200

    sample = random.sample(questions, min(5, len(questions)))
    return jsonify({
        'questions': [q.to_dict() for q in sample],
        'already_attempted': attempt is not None,
        'coins_earned_this_week': attempt.coins_earned if attempt else 0,
    }), 200


@dashboard_bp.route('/submit-quiz', methods=['POST'])
@jwt_required()
def submit_quiz():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Block re-attempt this week
    week_start = date.today() - timedelta(days=date.today().weekday())
    existing = QuizAttempt.query.filter(
        QuizAttempt.user_id == user.id,
        QuizAttempt.attempt_date >= week_start
    ).first()
    if existing:
        return jsonify({'error': 'You already completed this week\'s quiz'}), 409

    data = request.get_json()
    answers = data.get('answers', {})  # {question_id: 'a'|'b'|'c'|'d'}

    question_ids = [int(k) for k in answers.keys()]
    questions = Quiz.query.filter(Quiz.id.in_(question_ids)).all()

    score = sum(1 for q in questions if answers.get(str(q.id), '').lower() == q.correct_answer)
    total = len(questions)

    # Coin reward tiers
    if score == total and total >= 5:
        coins = 200
    elif score >= 5:
        coins = 120
    elif score >= 3:
        coins = 60
    elif score >= 1:
        coins = 20
    else:
        coins = 0

    user.coins += coins
    db.session.add(QuizAttempt(user_id=user.id, score=score, coins_earned=coins))
    db.session.commit()

    return jsonify({
        'score': score,
        'total': total,
        'coins_earned': coins,
        'user': user.to_dict(),
    }), 200


@dashboard_bp.route('/leaderboard', methods=['GET'])
@jwt_required()
def leaderboard():
    user = get_current_user()
    top_users = User.query.filter_by(is_verified=True).order_by(User.xp.desc()).limit(100).all()

    def rank_coins(rank):
        if rank == 1: return 5000
        if rank == 2: return 2500
        if rank == 3: return 1000
        if rank <= 10: return 750
        if rank <= 50: return 500
        return 100

    board = [
        {
            'rank': i + 1,
            'name': u.full_name,
            'xp': u.xp + (u.level - 1) * 1000,   # display cumulative XP
            'level': u.level,
            'coins': u.coins,
            'rank_coins': rank_coins(i + 1),
            'is_current_user': u.id == user.id,
        }
        for i, u in enumerate(top_users)
    ]

    # Find current user's rank if not in top 100
    user_rank = next((e['rank'] for e in board if e['is_current_user']), None)
    if user_rank is None:
        count = User.query.filter(User.xp > user.xp, User.is_verified == True).count()
        user_rank = count + 1

    return jsonify({'leaderboard': board, 'your_rank': user_rank}), 200


@dashboard_bp.route('/coins', methods=['GET'])
@jwt_required()
def coins():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'coins': user.coins, 'user': user.to_dict()}), 200


@dashboard_bp.route('/seed-quiz', methods=['POST'])
def seed_quiz():
    """Seed question bank (admin only in dev — no auth for simplicity)."""
    if Quiz.query.count() > 0:
        return jsonify({'message': 'Already seeded'}), 200

    questions = [
        # Saving
        Quiz(topic='Saving', question='What percentage of income does the 50/30/20 rule recommend saving?',
             option_a='10%', option_b='20%', option_c='30%', option_d='40%', correct_answer='b'),
        Quiz(topic='Saving', question='Which saving method involves setting aside money automatically each month?',
             option_a='Manual saving', option_b='Pay yourself first', option_c='Impulse saving', option_d='Budget saving', correct_answer='b'),
        Quiz(topic='Saving', question='An emergency fund should ideally cover how many months of expenses?',
             option_a='1', option_b='2', option_c='3–6', option_d='12', correct_answer='c'),
        Quiz(topic='Saving', question='What is the best account for an emergency fund?',
             option_a='Stocks', option_b='Savings account', option_c='Crypto', option_d='Real estate', correct_answer='b'),
        # Budgeting
        Quiz(topic='Budgeting', question='What does a "zero-based budget" mean?',
             option_a='Spending nothing', option_b='Every rupee is assigned a job', option_c='Only spending on needs', option_d='Saving zero money', correct_answer='b'),
        Quiz(topic='Budgeting', question='Which of the following is a "need"?',
             option_a='New phone', option_b='Movie tickets', option_c='Rent', option_d='Dining out', correct_answer='c'),
        Quiz(topic='Budgeting', question='Tracking expenses helps you to:',
             option_a='Earn more money', option_b='Identify spending habits', option_c='Avoid taxes', option_d='Get bank loans', correct_answer='b'),
        # Interest
        Quiz(topic='Interest', question='What is compound interest?',
             option_a='Interest on principal only', option_b='Interest on interest', option_c='Interest paid once', option_d='Zero-rate interest', correct_answer='b'),
        Quiz(topic='Interest', question='Which type of interest grows your savings faster?',
             option_a='Simple interest', option_b='Compound interest', option_c='Fixed interest', option_d='Flat rate interest', correct_answer='b'),
        Quiz(topic='Interest', question='If you save ₹1000 at 10% simple interest for 2 years, interest earned is:',
             option_a='₹100', option_b='₹200', option_c='₹210', option_d='₹220', correct_answer='b'),
        # Investing
        Quiz(topic='Investing', question='What does a mutual fund do?',
             option_a='Lends money to banks', option_b='Pools money from investors to buy assets', option_c='Prints currency', option_d='Pays fixed salary', correct_answer='b'),
        Quiz(topic='Investing', question='What is a stock?',
             option_a='A loan to a company', option_b='Part ownership in a company', option_c='A type of savings account', option_d='Government bond', correct_answer='b'),
        Quiz(topic='Investing', question='Diversification in investing means:',
             option_a='Putting all money in one asset', option_b='Spreading investments across assets', option_c='Avoiding investments', option_d='Only buying gold', correct_answer='b'),
        Quiz(topic='Investing', question='What is a SIP (Systematic Investment Plan)?',
             option_a='One-time large investment', option_b='Regular fixed-amount investment', option_c='Government scheme', option_d='Bank loan', correct_answer='b'),
        Quiz(topic='Investing', question='Risk and return in investing are generally:',
             option_a='Unrelated', option_b='Inversely related', option_c='Directly related', option_d='Always equal', correct_answer='c'),
    ]
    db.session.bulk_save_objects(questions)
    db.session.commit()
    return jsonify({'message': f'Seeded {len(questions)} questions'}), 201
