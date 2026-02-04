from flask import Blueprint, request, jsonify, session
from ..services.auth_service import register_user, authenticate_user, get_user_by_username

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/check', methods=['GET'])
def check_auth():
    if 'user' in session:
        user = get_user_by_username(session['user'])
        if user:
            return jsonify({'authenticated': True, 'username': user['username'], 'role': user['role']})
    return jsonify({'authenticated': False})

@auth_bp.route('/register', methods=['POST'])
@auth_bp.route('/signup', methods=['POST']) # Alias
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Missing credentials'}), 400
        
    user = register_user(username, password)
    if not user:
        return jsonify({'error': 'User already exists'}), 400
        
    return jsonify({'message': 'Registration successful'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    print(f"DEBUG: Login attempt for user '{username}' with password length {len(password) if password else 0}")

    user = authenticate_user(username, password)
    if user:
        print(f"DEBUG: Login successful for '{username}'")
        session['user'] = user['username']
        session['role'] = user['role']
        return jsonify({'message': 'Login successful', 'role': user['role'], 'username': user['username']})
    
    print(f"DEBUG: Login failed for '{username}'")
    return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    session.pop('role', None)
    return jsonify({'message': 'Logged out'})
