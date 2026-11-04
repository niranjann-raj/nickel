import sys
import os
import psycopg2
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

if __name__ == '__main__':
    email = sys.argv[1].lower() if len(sys.argv) > 1 else ''
    if email and email.endswith('@example.com'):
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        cur.execute("DELETE FROM otp_tokens WHERE LOWER(email)=%s", (email,))
        cur.execute("DELETE FROM users WHERE LOWER(email)=%s", (email,))
        conn.commit()
        cur.close()
        conn.close()
        print(f"Cleaned {email}")
