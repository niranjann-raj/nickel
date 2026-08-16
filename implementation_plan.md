# Security Hardening: Passwords & Data-at-Rest

This plan outlines the implementation of Phase 1 (Argon2id password hashing) and Phase 2 (AES-GCM database encryption) to secure the Nickel application without breaking existing functionality.

## User Review Required

> [!IMPORTANT]
> - **Pepper requirement**: A `PASSWORD_PEPPER` will be required in `.env` for Argon2id hashing. If it's missing, the app will fail to start to enforce security.
> - **Encryption Key**: A `NICKEL_ENCRYPTION_KEY` will be required in `.env` to perform AES-256-GCM encryption.
> - **Migration Strategy**: I will create a script `migrate_encryption.py` to encrypt existing plaintext data in the database safely, rather than silently breaking it.
> - **Password Migration**: Existing bcrypt hashes will be gracefully migrated to Argon2id upon the user's next successful login, preventing mass invalidation.

## Proposed Changes

### Configuration & Utilities
#### [NEW] `utils/security.py`
- Create `hash_password(password)` and `verify_password(password, hashed)` using `argon2-cffi`.
- Integrate `PASSWORD_PEPPER` using HMAC-SHA256 before hashing.
- Create SQLAlchemy `TypeDecorator` classes: `EncryptedString` and `EncryptedFloat` using AES-256-GCM (`cryptography.hazmat`) to transparently encrypt/decrypt database values on read/write.

#### [MODIFY] `requirements.txt`
- Add `argon2-cffi` and `cryptography`.

### Phase 1: Password Security
#### [MODIFY] `routes/auth.py`
- Replace `flask_bcrypt` with `utils.security` functions.
- Update `/register`, `/reset-password`, and `/change-password` to save Argon2id hashes.
- Update `/login` to support graceful migration: if the stored hash is a bcrypt hash (starts with `$2b$`), verify it using bcrypt, and if successful, silently rehash the password to Argon2id and save it.

### Phase 2: Database / Data Security
#### [MODIFY] `models.py`
Change the following sensitive fields to use the new `EncryptedString` or `EncryptedFloat` types. This ensures encryption at rest while keeping the application logic 100% untouched.

**HIGHLY SENSITIVE (Encrypted)**
- `BankAccount.balance`
- `SavingsWallet.balance`
- `Transaction.amount`

**SENSITIVE (Encrypted)**
- `User.phone`
- `Transaction.description`
- `GoalTransaction.description`

**NORMAL (Unencrypted)**
- `User.xp`, `User.level`, `User.is_verified` (Cannot be encrypted because they are used in SQL `order_by` and `filter` for leaderboards).
- `User.email` (Cannot be encrypted because it requires exact match lookup via `filter_by` during login).

#### [NEW] `migrate_encryption.py`
- Create a script that reads existing plaintext rows, passes them through the SQLAlchemy ORM (which will trigger the `process_bind_param` to encrypt them), and commits the encrypted versions back to the DB to ensure no data is lost.

## Verification Plan

### Automated Tests
- Test that two users with the exact same password generate completely different Argon2id hashes (verifies unique salting).
- Test that old Bcrypt users can still log in and are upgraded to Argon2id.
- Test that AES-GCM decryption handles tampering by raising a safe error rather than returning corrupt data.

### Manual Verification
- Test registration, login, logout, password reset, and profile updates.
- Verify that Goal AutoPay, Dashboard, and Gamification (Leaderboard) still work flawlessly.
- Verify the Gemini AI integration still works successfully.
