from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, DailySpin
from datetime import date, datetime, timezone
import random

gamification_bp = Blueprint('gamification', __name__)

@gamification_bp.route('/spin/status', methods=['GET'])
@jwt_required()
def spin_status():
    user_id = get_jwt_identity()
    today = date.today()
    spin = DailySpin.query.filter_by(user_id=user_id, date=today).first()
    return jsonify({
        'can_spin': spin is None
    })

@gamification_bp.route('/spin', methods=['POST'])
@jwt_required()
def spin_wheel():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    today = date.today()
    
    # Check if user already spun today
    # We use a transaction to lock or just rely on simple logic since the traffic is low, 
    # but a simple filter is fine for this requirement.
    existing_spin = DailySpin.query.filter_by(user_id=user_id, date=today).first()
    if existing_spin:
        return jsonify({'error': 'You have already used your daily spin today.'}), 400

    # Define rewards and probabilities
    rewards = [
        {'id': 1, 'type': 'LOSS', 'name': 'Better Luck Next Time', 'prob': 30, 'value': 0},
        {'id': 2, 'type': 'COINS', 'name': '1 Coin', 'prob': 25, 'value': 1},
        {'id': 3, 'type': 'COINS', 'name': '10 Coins', 'prob': 20, 'value': 10},
        {'id': 4, 'type': 'COINS', 'name': '100 Coins', 'prob': 10, 'value': 100},
        {'id': 5, 'type': 'COINS', 'name': '1,000 Coins', 'prob': 1, 'value': 1000},
        {'id': 6, 'type': 'XP', 'name': '+100 XP', 'prob': 8, 'value': 100},
        {'id': 7, 'type': 'SHIELD', 'name': 'Streak Shield', 'prob': 5, 'value': 1},
        {'id': 8, 'type': 'AVATAR', 'name': 'Legendary Avatar', 'prob': 1, 'value': 'NICKEL_PHANTOM'}
    ]

    # Weighted random choice
    population = [r for r in rewards]
    weights = [r['prob'] for r in rewards]
    selected_reward = random.choices(population, weights=weights, k=1)[0]

    # Apply reward
    if selected_reward['type'] == 'COINS':
        user.coins += selected_reward['value']
    elif selected_reward['type'] == 'XP':
        user.xp += selected_reward['value']
        user.lifetime_xp += selected_reward['value']
    elif selected_reward['type'] == 'SHIELD':
        user.streak_shields += selected_reward['value']
    elif selected_reward['type'] == 'AVATAR':
        avatars = user.unlocked_avatars.split(',') if user.unlocked_avatars else []
        if selected_reward['value'] not in avatars:
            avatars.append(selected_reward['value'])
            user.unlocked_avatars = ','.join(avatars)

    # Record spin
    new_spin = DailySpin(
        user_id=user.id,
        date=today,
        reward=selected_reward['name'],
        reward_type=selected_reward['type']
    )
    db.session.add(new_spin)
    db.session.commit()

    return jsonify({
        'success': True,
        'reward': selected_reward
    })
