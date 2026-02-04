import os
from dotenv import load_dotenv
import urllib.parse

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    
    # robust URI construction
    _uri = os.environ.get('MONGO_URI')
    if not _uri:
        _user = os.environ.get('MONGO_USER', '')
        _pwd = os.environ.get('MONGO_PASSWORD', '')
        _cluster = os.environ.get('MONGO_CLUSTER', '')
        _db = os.environ.get('MONGO_DB_NAME', 'stockdb')
        
        if _user and _pwd and _cluster:
            _user_escaped = urllib.parse.quote_plus(_user)
            _pwd_escaped = urllib.parse.quote_plus(_pwd)
            _uri = f"mongodb+srv://{_user_escaped}:{_pwd_escaped}@{_cluster}/{_db}?retryWrites=true&w=majority"
            print(f"DEBUG: Constructed URI: mongodb+srv://{_user}:****@{_cluster}/{_db}")
        else:
            _uri = 'mongodb://localhost:27017/stockdb'
            print("DEBUG: Using Localhost URI")
            
    MONGO_URI = _uri

    ALPHA_VANTAGE_KEY = os.environ.get('ALPHA_VANTAGE_KEY') or 'RTSTRBKY4VDW8QLP'
    INITIAL_VIRTUAL_BALANCE = 100000.0
