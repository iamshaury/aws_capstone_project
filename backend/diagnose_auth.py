import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient
import urllib.parse
from werkzeug.security import check_password_hash

# Load env
load_dotenv()

def get_db():
    uri = os.environ.get('MONGO_URI')
    if not uri:
        user = os.environ.get('MONGO_USER', '')
        pwd = os.environ.get('MONGO_PASSWORD', '')
        cluster = os.environ.get('MONGO_CLUSTER', '')
        db_name = os.environ.get('MONGO_DB_NAME', 'stockdb')
        
        if user and pwd and cluster:
            user_esc = urllib.parse.quote_plus(user)
            pwd_esc = urllib.parse.quote_plus(pwd)
            uri = f"mongodb+srv://{user_esc}:{pwd_esc}@{cluster}/{db_name}?retryWrites=true&w=majority"
        else:
            uri = 'mongodb://localhost:27017/stockdb'
    
    print(f"Connecting to: {uri.split('@')[-1]}") # Obscure credentials
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        client.server_info() # Trigger connection
        return client.get_database()
    except Exception as e:
        print(f"Connection failed: {e}")
        return None

def diagnose():
    db = get_db()
    if db is None:
        return

    print("\n--- Users in DB ---")
    users = list(db.users.find({}))
    print(f"Total Users: {len(users)}")
    for u in users:
        print(f" - {u.get('username')} (Role: {u.get('role')})")

    print("\n--- Password Test ---")
    target_user = "admin" # Default check
    test_pass = "admin123"
    
    user = db.users.find_one({'username': target_user})
    if user:
        print(f"User '{target_user}' found.")
        print(f"Stored Hash: {user.get('passwordHash')}")
        if check_password_hash(user['passwordHash'], test_pass):
            print(f"✅ Password '{test_pass}' matches!")
        else:
            print(f"❌ Password '{test_pass}' does NOT match.")
    else:
        print(f"❌ User '{target_user}' NOT found.")

if __name__ == "__main__":
    diagnose()
