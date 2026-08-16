import os
import hmac
import hashlib
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from sqlalchemy.types import TypeDecorator, String, Float

# Initialize Argon2id password hasher
# Default argon2-cffi parameters meet OWASP recommendations for Argon2id
ph = PasswordHasher()

def get_pepper() -> bytes:
    pepper = os.environ.get('PASSWORD_PEPPER')
    if not pepper:
        raise ValueError("SECURITY FATAL: PASSWORD_PEPPER environment variable is not set.")
    return pepper.encode('utf-8')

def pepper_password(password: str) -> bytes:
    # Use HMAC-SHA256 to combine pepper and password safely
    return hmac.new(get_pepper(), password.encode('utf-8'), hashlib.sha256).digest()

def hash_password(password: str) -> str:
    peppered = pepper_password(password)
    # Generates a unique salt automatically and returns Argon2id hash string
    return ph.hash(peppered)

def verify_password(password: str, hashed: str) -> bool:
    try:
        peppered = pepper_password(password)
        return ph.verify(hashed, peppered)
    except VerifyMismatchError:
        return False

# --- Phase 2: Data Encryption ---

def get_encryption_key() -> bytes:
    key_hex = os.environ.get('NICKEL_ENCRYPTION_KEY')
    if not key_hex:
        raise ValueError("SECURITY FATAL: NICKEL_ENCRYPTION_KEY environment variable is not set.")
    
    try:
        key = bytes.fromhex(key_hex)
    except ValueError:
        raise ValueError("SECURITY FATAL: NICKEL_ENCRYPTION_KEY must be a valid hex string.")
        
    if len(key) != 32:
        raise ValueError("SECURITY FATAL: NICKEL_ENCRYPTION_KEY must be a 64-character hex string (32 bytes for AES-256).")
    return key

def encrypt_data(plaintext_bytes: bytes) -> bytes:
    key = get_encryption_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)  # 96-bit nonce is standard for AES-GCM
    ciphertext = aesgcm.encrypt(nonce, plaintext_bytes, None)
    return nonce + ciphertext

def decrypt_data(encrypted_bytes: bytes) -> bytes:
    key = get_encryption_key()
    aesgcm = AESGCM(key)
    if len(encrypted_bytes) < 12:
        raise ValueError("Invalid encrypted data format.")
    nonce = encrypted_bytes[:12]
    ciphertext = encrypted_bytes[12:]
    return aesgcm.decrypt(nonce, ciphertext, None)

class EncryptedString(TypeDecorator):
    """Transparently encrypts string data using AES-256-GCM."""
    impl = String
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        plaintext_bytes = str(value).encode('utf-8')
        encrypted_bytes = encrypt_data(plaintext_bytes)
        return encrypted_bytes.hex()

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        try:
            encrypted_bytes = bytes.fromhex(value)
            plaintext_bytes = decrypt_data(encrypted_bytes)
            return plaintext_bytes.decode('utf-8')
        except Exception:
            raise ValueError("Failed to decrypt String data. Key may be invalid or data is corrupt.")


class EncryptedFloat(TypeDecorator):
    """Transparently encrypts float data using AES-256-GCM."""
    impl = String # Stored as hex string in the DB
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        plaintext_bytes = str(value).encode('utf-8')
        encrypted_bytes = encrypt_data(plaintext_bytes)
        return encrypted_bytes.hex()

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        try:
            encrypted_bytes = bytes.fromhex(value)
            plaintext_bytes = decrypt_data(encrypted_bytes)
            return float(plaintext_bytes.decode('utf-8'))
        except Exception:
            raise ValueError("Failed to decrypt Float data.")
