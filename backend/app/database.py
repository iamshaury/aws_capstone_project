from .config import Config
from pymongo import MongoClient
import sys

# ==========================================
# OPTION 1: REAL MONGODB CONNECTION
# ==========================================
try:
    client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=5000)
    # Validate connection
    # client.server_info() # Force connection check
    db = client.get_database() # Uses database name from URI
    print(f"✅ Connected to Mongo URI (Host: {client.address})")
except Exception as e:
    print(f"❌ Failed to connect to MongoDB: {e}")
    # Fallback to Mock if connection fails? 
    # For now, let's allow it to proceed so we can see the error or if it worked.
    # db = None 
    raise e

# ==========================================
# OPTION 2: MOCK DATABASE (For Demo/Dev without Mongo)
# Comment this section out when using Option 1
# ==========================================
class MockCollection:
    def __init__(self, name):
        self.name = name
        self.data = [] # List of dicts

    def insert_one(self, document):
        if '_id' not in document:
            from bson import ObjectId
            document['_id'] = str(ObjectId())
        self.data.append(document)
        return type('InsertOneResult', (object,), {'inserted_id': document['_id']})()

    def find_one(self, query):
        for doc in self.data:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return doc
        return None

    def find(self, query={}):
        results = []
        for doc in self.data:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                results.append(doc)
        return results

    def update_one(self, query, update):
        doc = self.find_one(query)
        if doc:
            # Handle $set
            if '$set' in update:
                for k, v in update['$set'].items():
                    doc[k] = v
            # Handle $inc
            if '$inc' in update:
                for k, v in update['$inc'].items():
                    doc[k] = doc.get(k, 0) + v
            return type('UpdateResult', (object,), {'modified_count': 1})()
        return type('UpdateResult', (object,), {'modified_count': 0})()

    def delete_one(self, query):
        doc = self.find_one(query)
        if doc:
            self.data.remove(doc)
            return type('DeleteResult', (object,), {'deleted_count': 1})()
        return type('DeleteResult', (object,), {'deleted_count': 0})()

class MockDB:
    def __init__(self):
        self.users = MockCollection('users')
        self.stocks = MockCollection('stocks')
        self.portfolio = MockCollection('portfolio')
        self.trades = MockCollection('trades')

# Global Instance (Mock)
# db = MockDB()  <-- COMMENTED OUT TO USE REAL DB

# Seed Admin (Mock) - This creates usage of 'db', so it must be valid
from werkzeug.security import generate_password_hash
try:
    admin_exists = db.users.find_one({'username': 'admin'})
    if not admin_exists:
        db.users.insert_one({
            'username': 'admin',
            'passwordHash': generate_password_hash('admin123'),
            'role': 'ADMIN',
            'virtualBalance': 1000000.0,
            'email': 'admin@stocker.com'
        })
        print("seeded admin user")
except Exception as e:
    print(f"Error seeding admin: {e}")
# ==========================================
