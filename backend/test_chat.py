from dotenv import load_dotenv
load_dotenv()

import os
from app import create_app
from models import User

app = create_app()

with app.app_context():
    # Simulate chat error by calling the logic inside chat()
    user = User.query.first()
    if not user:
        print("No user")
        exit()
        
    api_key = os.environ.get('GEMINI_API_KEY')
    print(f"Key loaded: {bool(api_key)}")
    
    try:
        from google import genai
        from google.genai import types
        
        client = genai.Client(api_key=api_key)
        
        from utils.ai_context import build_nickel_context
        nickel_context = build_nickel_context(user.id)
        
        system_prompt = f"""You are Nickel AI...
{nickel_context}
"""
        contents = [types.Content(role="user", parts=[types.Part(text="Hello")])]
        
        print("Calling generate_content...")
        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=contents,
            config=types.GenerateContentConfig(system_instruction=system_prompt)
        )
        print("SUCCESS:", response.text)
    except Exception as e:
        print(f"FAILED WITH EXCEPTION: {e}")
        import traceback
        traceback.print_exc()
