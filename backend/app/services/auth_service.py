from werkzeug.security import generate_password_hash, check_password_hash
from ..database import db
from ..config import Config

def register_user(username, password, email=None):
    if db.users.find_one({'username': username}):
        return None  # Already exists
    
    hashed_password = generate_password_hash(password)
    new_user = {
        'username': username,
        'passwordHash': hashed_password,
        'email': email,
        'role': 'USER',
        'virtualBalance': Config.INITIAL_VIRTUAL_BALANCE
    }
    db.users.insert_one(new_user)
    return new_user

def authenticate_user(username, password):
    print(f"DEBUG: authenticate_user called for '{username}'")
    user = db.users.find_one({'username': username})
    if not user:
        print(f"DEBUG: User '{username}' not found in DB")
    else:
        print(f"DEBUG: User '{username}' found. Checking password...")
        if check_password_hash(user['passwordHash'], password):
            print("DEBUG: Password match")
            return user
        else:
            print("DEBUG: Password mismatch")
    return None

def get_user_by_username(username):
    return db.users.find_one({'username': username})
