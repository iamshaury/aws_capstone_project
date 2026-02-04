from app import create_app
from app.database import db

app = create_app()

with app.app_context():
    print("Checking users in database...")
    try:
        users = list(db.users.find({}))
        print(f"Found {len(users)} users.")
        for user in users:
            print(f"Username: {user.get('username')}, Role: {user.get('role')}")
    except Exception as e:
        print(f"Error accessing database: {e}")
