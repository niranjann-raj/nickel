from app import create_app
from models import db, BankAccount, Transaction, User

app = create_app()

with app.app_context():
    print("Testing transparent decryption...")
    
    # Check bank account
    bank = BankAccount.query.first()
    if bank:
        print(f"Bank Account ID: {bank.id}, Balance (type: {type(bank.balance)}): {bank.balance}")
    else:
        print("No bank accounts found.")
        
    # Check transaction
    tx = Transaction.query.first()
    if tx:
        print(f"Transaction ID: {tx.id}, Amount (type: {type(tx.amount)}): {tx.amount}, Desc: {tx.description}")
    else:
        print("No transactions found.")
        
    # Check user phone
    user = User.query.first()
    if user:
        print(f"User ID: {user.id}, Phone: {user.phone}")
        
    print("Test complete.")
