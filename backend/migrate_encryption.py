import os
from sqlalchemy import text
from app import create_app
from models import db
from utils.security import encrypt_data

app = create_app()

with app.app_context():
    with db.engine.connect() as conn:
        print("Starting encryption migration...")
        
        # 1. Update User.phone to TEXT just in case
        print("Altering users.phone...")
        conn.execute(text("ALTER TABLE users ALTER COLUMN phone TYPE TEXT;"))
        
        # 2. BankAccount.balance
        print("Migrating bank_account.balance...")
        rows = conn.execute(text("SELECT id, balance FROM bank_account")).fetchall()
        conn.execute(text("ALTER TABLE bank_account ALTER COLUMN balance TYPE TEXT USING balance::text;"))
        for row in rows:
            if row.balance is not None:
                # row.balance is a float originally
                pt = str(row.balance).encode('utf-8')
                enc = encrypt_data(pt).hex()
                conn.execute(text("UPDATE bank_account SET balance = :enc WHERE id = :id"), {"enc": enc, "id": row.id})
                
        # 3. Transaction.amount
        print("Migrating transactions.amount & description...")
        rows = conn.execute(text("SELECT id, amount, description FROM transactions")).fetchall()
        conn.execute(text("ALTER TABLE transactions ALTER COLUMN amount TYPE TEXT USING amount::text;"))
        conn.execute(text("ALTER TABLE transactions ALTER COLUMN description TYPE TEXT;"))
        for row in rows:
            enc_amount = encrypt_data(str(row.amount).encode('utf-8')).hex() if row.amount is not None else None
            enc_desc = encrypt_data(str(row.description).encode('utf-8')).hex() if row.description else None
            conn.execute(text("UPDATE transactions SET amount = :amount, description = :desc WHERE id = :id"), 
                         {"amount": enc_amount, "desc": enc_desc, "id": row.id})
                         
        # 4. SavingsWallet.balance
        print("Migrating savings_wallet.balance...")
        rows = conn.execute(text("SELECT id, balance FROM savings_wallet")).fetchall()
        conn.execute(text("ALTER TABLE savings_wallet ALTER COLUMN balance TYPE TEXT USING balance::text;"))
        for row in rows:
            if row.balance is not None:
                pt = str(row.balance).encode('utf-8')
                enc = encrypt_data(pt).hex()
                conn.execute(text("UPDATE savings_wallet SET balance = :enc WHERE id = :id"), {"enc": enc, "id": row.id})
                
        # 5. GoalTransaction.amount and description
        print("Migrating goal_transactions.amount & description...")
        rows = conn.execute(text("SELECT id, amount, description FROM goal_transactions")).fetchall()
        conn.execute(text("ALTER TABLE goal_transactions ALTER COLUMN amount TYPE TEXT USING amount::text;"))
        conn.execute(text("ALTER TABLE goal_transactions ALTER COLUMN description TYPE TEXT;"))
        for row in rows:
            enc_amount = encrypt_data(str(row.amount).encode('utf-8')).hex() if row.amount is not None else None
            enc_desc = encrypt_data(str(row.description).encode('utf-8')).hex() if row.description else None
            conn.execute(text("UPDATE goal_transactions SET amount = :amount, description = :desc WHERE id = :id"), 
                         {"amount": enc_amount, "desc": enc_desc, "id": row.id})

        # 6. User.phone encryption
        print("Migrating users.phone...")
        rows = conn.execute(text("SELECT id, phone FROM users")).fetchall()
        for row in rows:
            if row.phone and not row.phone.startswith('01234'): # simple check to avoid double encrypt
                pt = str(row.phone).encode('utf-8')
                enc = encrypt_data(pt).hex()
                conn.execute(text("UPDATE users SET phone = :enc WHERE id = :id"), {"enc": enc, "id": row.id})

        conn.commit()
        print("Migration complete!")
