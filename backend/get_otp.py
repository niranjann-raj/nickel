import sys
import os
import psycopg2
from dotenv import load_dotenv

# Load database URL from backend/.env
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

if __name__ == '__main__':
    email = sys.argv[1].lower() if len(sys.argv) > 1 else ''
    purpose = sys.argv[2] if len(sys.argv) > 2 else 'register'
    db_url = os.environ.get('DATABASE_URL')
    
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute(
        "SELECT otp_code FROM otp_tokens WHERE LOWER(email)=%s AND purpose=%s AND used=false ORDER BY created_at DESC LIMIT 1",
        (email, purpose)
    )
    row = cur.fetchone()
    print(row[0] if row else '')
    cur.close()
    conn.close()
