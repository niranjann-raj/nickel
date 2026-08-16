from app import create_app
from models import db, User
from utils.security import hash_password

app = create_app()

with app.app_context():
    # Test unique salting
    pass_str = "TestPassword123"
    hash1 = hash_password(pass_str)
    hash2 = hash_password(pass_str)
    
    print(f"Hash 1: {hash1}")
    print(f"Hash 2: {hash2}")
    
    if hash1 != hash2:
        print("SUCCESS: Unique salting works! Hashes are different.")
    else:
        print("ERROR: Hashes are identical.")
