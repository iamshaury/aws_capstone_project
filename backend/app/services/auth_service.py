from werkzeug.security import generate_password_hash, check_password_hash
from ..database import users_table
from ..config import Config
from botocore.exceptions import ClientError
from decimal import Decimal

def register_user(username, password, email=None):
    # Check if user exists
    try:
        response = users_table.get_item(Key={'username': username})
        if 'Item' in response:
            return None # Already exists
            
        hashed_password = generate_password_hash(password)
        new_user = {
            'username': username,
            'passwordHash': hashed_password,
            'email': email,
            'role': 'USER',
            'virtualBalance': Decimal(str(Config.INITIAL_VIRTUAL_BALANCE)) # DynamoDB requires Decimal for floats
        }
        
        users_table.put_item(Item=new_user)
        return new_user
    except ClientError as e:
        print(f"Error registering user: {e}")
        return None

def authenticate_user(username, password):
    print(f"DEBUG: authenticate_user called for '{username}'")
    try:
        response = users_table.get_item(Key={'username': username})
        if 'Item' not in response:
            print(f"DEBUG: User '{username}' not found in DB")
            return None
            
        user = response['Item']
        print(f"DEBUG: User '{username}' found. Checking password...")
        
        if check_password_hash(user['passwordHash'], password):
            print("DEBUG: Password match")
            return user
        else:
            print("DEBUG: Password mismatch")
            return None
    except ClientError as e:
        print(f"Error authenticating user: {e}")
        return None

def get_user_by_username(username):
    try:
        response = users_table.get_item(Key={'username': username})
        return response.get('Item')
    except ClientError as e:
        print(f"Error getting user: {e}")
        return None
