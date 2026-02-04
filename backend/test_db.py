import os
from dotenv import load_dotenv
import urllib.parse
from pymongo import MongoClient
import sys

# Load env from current directory
load_dotenv()

def test_connection():
    print("--- MongoDB Connection Tester ---")
    
    # Replicate logic from config.py
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
            print(f"Constructed URI: mongodb+srv://{user}:****@{cluster}/{db_name}")
        else:
            print("Missing MONGO_USER / MONGO_PASSWORD / MONGO_CLUSTER in .env")
            return

    try:
        print("Attempting to connect...")
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        # Force a command to verify auth
        info = client.server_info()
        print("✅ SUCCESS! Connected to:")
        print(f"Version: {info.get('version')}")
        print(f"Address: {client.address}")
        
    except Exception as e:
        print("\n❌ CONNECTION FAILED")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {e}")
        
        if "bad auth" in str(e):
            print("\n💡 TIP: 'bad auth' means the USERNAME or PASSWORD is incorrect.")
            print("1. Check if user 'pyqOrganizer' exists in Atlas.")
            print("2. Check if the password in .env matches EXACTLY.")
            print("3. Ensure the user has 'readWrite' permissions on 'stockdb'.")

if __name__ == "__main__":
    test_connection()
