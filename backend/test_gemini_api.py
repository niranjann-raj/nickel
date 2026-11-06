import os
from dotenv import load_dotenv
load_dotenv()

from google import genai
from google.genai import types

api_key = os.environ.get('GEMINI_API_KEY')

from routes.dashboard import generate_with_gemini

try:
    client = genai.Client(api_key=api_key)
    response_text = generate_with_gemini(client, contents="Say hello")
    print("SUCCESS")
    print(response_text)
except Exception as e:
    print(f"ERROR: {e}")
