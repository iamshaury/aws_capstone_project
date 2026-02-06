from flask import Blueprint, request, jsonify, session, render_template, redirect, url_for, flash
from ..services.auth_service import register_user, authenticate_user, get_user_by_username

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['GET', 'POST'])
@auth_bp.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'GET':
        return render_template('register.html')
        
    # Handle Form or JSON
    if request.is_json:
        data = request.json
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
    else:
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
    
    if not username or not password:
        flash('Username and password required', 'error')
        return redirect(url_for('auth.signup'))
        
    user = register_user(username, password, email)
    if not user:
        flash('Username already exists', 'error')
        return redirect(url_for('auth.signup'))
        
    flash('Account created! Please login.', 'success')
    return redirect(url_for('auth.login'))

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
        
    if request.is_json:
        data = request.json
        username = data.get('username')
        password = data.get('password')
    else:
        username = request.form.get('username')
        password = request.form.get('password')
    
    user = authenticate_user(username, password)
    if user:
        session['user'] = user['username']
        session['role'] = user['role']
        flash('Login successful!', 'success')
        return redirect(url_for('stock.dashboard'))
    
    flash('Invalid username or password', 'error')
    return redirect(url_for('auth.login'))

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    session.pop('role', None)
    flash('Logged out successfully.', 'success')
    return redirect(url_for('auth.login'))
