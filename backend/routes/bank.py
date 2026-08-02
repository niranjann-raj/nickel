from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, BankAccount, Transaction
from datetime import datetime, timezone

bank_bp = Blueprint('bank', __name__)

def get_current_user():
    return User.query.get(int(get_jwt_identity()))

def get_or_create_bank(user_id):
    bank = BankAccount.query.filter_by(user_id=user_id).first()
    if not bank:
        bank = BankAccount(user_id=user_id, balance=0.0)
        db.session.add(bank)
        db.session.commit()
    return bank

@bank_bp.route('/balance', methods=['GET'])
@jwt_required()
def get_balance():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    bank = get_or_create_bank(user.id)
    return jsonify({
        'balance': bank.balance,
        'updated_at': bank.updated_at.isoformat() if bank.updated_at else None
    }), 200

@bank_bp.route('/deposit', methods=['POST'])
@jwt_required()
def deposit():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    amount = float(data.get('amount', 0))
    description = data.get('description', 'Manual Deposit')
    
    if amount <= 0:
        return jsonify({'error': 'Amount must be positive'}), 400
        
    bank = get_or_create_bank(user.id)
    bank.balance += amount
    tx = Transaction(
        user_id=user.id,
        type='CREDIT',
        amount=amount,
        description=description
    )
    db.session.add(tx)
    db.session.commit()
    
    return jsonify({
        'message': 'Deposit successful',
        'new_balance': bank.balance,
        'transaction_id': tx.id
    }), 200

@bank_bp.route('/edit', methods=['POST'])
@jwt_required()
def edit():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    data = request.get_json()
    new_balance = float(data.get('balance', 0))
    
    if new_balance < 0:
        return jsonify({'error': 'Balance cannot be negative'}), 400
        
    bank = get_or_create_bank(user.id)
    diff = new_balance - bank.balance
    bank.balance = new_balance
    
    tx = None
    if diff != 0:
        tx = Transaction(
            user_id=user.id,
            type='CREDIT' if diff > 0 else 'DEBIT',
            amount=abs(diff),
            description='Manual Balance Update'
        )
        db.session.add(tx)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Balance updated',
        'new_balance': bank.balance,
        'transaction_id': tx.id if tx else None
    }), 200

@bank_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    
    pagination = Transaction.query.filter_by(user_id=user.id).order_by(Transaction.created_at.desc()).paginate(page=page, per_page=limit, error_out=False)
    
    transactions = [{
        'id': t.id,
        'type': t.type,
        'amount': t.amount,
        'description': t.description,
        'created_at': t.created_at.isoformat() if t.created_at else None
    } for t in pagination.items]
    
    return jsonify({
        'transactions': transactions,
        'total_count': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200
