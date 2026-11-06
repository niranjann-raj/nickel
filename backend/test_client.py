import os
from dotenv import load_dotenv
load_dotenv()

from app import create_app
from models import User
from flask_jwt_extended import create_access_token

app = create_app()

with app.app_context():
    app.config['TESTING'] = True
    user = User.query.first()
    if not user:
        print("No user")
        exit()
        
    token = create_access_token(identity=str(user.id))
    client = app.test_client()
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'message': 'Hello',
        'history': []
    }
    
    print("Sending POST /api/chat...")
    response = client.post('/api/chat', headers=headers, json=data)
    print("STATUS:", response.status_code)
    try:
        print("RESPONSE:", response.get_json())
    except:
        print("RAW:", response.data)
