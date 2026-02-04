from flask import Flask, request, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import datetime
import random

app = Flask(__name__)
app.secret_key = 'stocker_secret_key'
CORS(app, supports_credentials=True)

# --- Mock Data Layer (In-Memory Database) ---
# This class encapsulates data access to make it easier to swap with AWS services later.
class DataStore:
    def __init__(self):
        self.users = {}        # { "username": {"password": "...", "balance": 10000.0, "role": "USER"} }
        self.portfolio = {}    # { "username": [{"ticker": "AAPL", "qty": 5, "price": 150}, ...] }
        self.transactions = [] # [{"user": "...", "ticker": "...", "qty":..., "type": "BUY/SELL", "time": ...}]

    def create_user(self, username, password, role="USER"):
        if username in self.users:
            return False
        self.users[username] = {'password': password, 'balance': 10000.0, 'role': role}
        self.portfolio[username] = []
        return True

    def get_user(self, username):
        return self.users.get(username)

    def update_balance(self, username, amount):
        if username in self.users:
            self.users[username]['balance'] += amount

    def add_to_portfolio(self, username, ticker, qty, price):
        # Simplified: flatten portfolio, multiple entries per ticker is fine for now,
        # but in a real app we'd aggregate. Let's aggregate for cleaner UI.
        user_port = self.portfolio.get(username, [])
        found = False
        for item in user_port:
            if item['ticker'] == ticker:
                # Weighted avg could be calc'd here, but keeping it simple: just update qty
                item['qty'] += qty
                found = True
                break
        if not found:
            user_port.append({'ticker': ticker, 'qty': qty, 'price': price})

    def remove_from_portfolio(self, username, ticker, qty):
        user_port = self.portfolio.get(username, [])
        for item in user_port:
            if item['ticker'] == ticker:
                if item['qty'] >= qty:
                    item['qty'] -= qty
                    if item['qty'] == 0:
                        user_port.remove(item)
                    return True
        return False

    def get_portfolio(self, username):
        return self.portfolio.get(username, [])

    def log_transaction(self, username, ticker, qty, trans_type, price):
        self.transactions.append({
            'user': username,
            'ticker': ticker,
            'qty': qty,
            'type': trans_type,
            'price': price,
            'time': datetime.datetime.now().isoformat()
        })

    def get_all_transactions(self):
        return self.transactions

db = DataStore()
# Create a default admin
db.create_user('admin', generate_password_hash('admin123'), role='ADMIN')

# --- Helper Functions ---
def get_stock_price(ticker):
    """
    Mock service to get stock price.
    In the future, this will call an external API or AWS Lambda.
    """
    # Deterministic "random" price based on ticker chars for consistency in demo
    seed = sum(ord(c) for c in ticker)
    random.seed(seed)
    base_price = random.uniform(50, 500)
    # Add some jitter
    price = base_price + random.uniform(-5, 5)
    return round(price, 2)

@app.route('/api/auth/check', methods=['GET'])
def auth_check():
    if 'user' in session:
        return jsonify({
            'authenticated': True,
            'username': session['user'],
            'role': session.get('role')
        })
    return jsonify({'authenticated': False}), 401

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = db.get_user(username)
    if user and check_password_hash(user['password'], password):
        session['user'] = username
        session['role'] = user['role']
        return jsonify({
            'message': 'Login successful',
            'role': user['role'],
            'username': username
        })

    return jsonify({'error': "Invalid username or password"}), 401

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    hashed_password = generate_password_hash(password)

    if db.create_user(username, hashed_password):
        return jsonify({'message': "Account created! Please login."})
    else:
        return jsonify({'error': "Username already exists!"}), 409

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    session.pop('role', None)
    return jsonify({'message': 'Logged out'})

@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    if 'user' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    username = session['user']
    user_data = db.get_user(username)
    if not user_data:
        session.pop('user', None)
        return jsonify({'error': 'User not found'}), 401

    user_portfolio = db.get_portfolio(username)

    # Calculate portfolio value
    total_portfolio_value = 0
    enriched_portfolio = []

    for item in user_portfolio:
        current_price = get_stock_price(item['ticker'])
        market_value = item['qty'] * current_price
        total_portfolio_value += market_value

        enriched_item = item.copy()
        enriched_item['current_price'] = current_price
        enriched_item['market_value'] = market_value
        # Gain/Loss since purchase (simplified, assuming 'price' is avg cost)
        enriched_item['gain_loss'] = market_value - (item['qty'] * item['price'])
        enriched_portfolio.append(enriched_item)

    return jsonify({
        'username': username,
        'balance': user_data['balance'],
        'portfolio': enriched_portfolio,
        'total_portfolio_value': total_portfolio_value
    })

@app.route('/api/admin/transactions', methods=['GET'])
def admin_transactions():
    if 'user' not in session or session.get('role') != 'ADMIN':
        return jsonify({'error': "Unauthorized access!"}), 403

    transactions = db.get_all_transactions()
    # Sort by time desc
    transactions.sort(key=lambda x: x['time'], reverse=True)

    return jsonify({'transactions': transactions})

@app.route('/api/stock/price/<ticker>', methods=['GET'])
def stock_price(ticker):
    price = get_stock_price(ticker.upper())
    return jsonify({'ticker': ticker.upper(), 'price': price})

@app.route('/api/buy', methods=['POST'])
def buy_stock():
    if 'user' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.json
    username = session['user']
    ticker = data.get('ticker').upper()
    qty = int(data.get('quantity'))
    price = get_stock_price(ticker)
    total_cost = qty * price

    user = db.get_user(username)
    if not user:
         session.pop('user', None)
         return jsonify({'error': 'User not found'}), 401

    if user['balance'] >= total_cost:
        db.update_balance(username, -total_cost)
        db.add_to_portfolio(username, ticker, qty, price)
        db.log_transaction(username, ticker, qty, 'BUY', price)
        return jsonify({'message': f"Bought {qty} {ticker} @ ${price}", 'balance': user['balance'] - total_cost})
    else:
        return jsonify({'error': "Insufficient funds!"}), 400

@app.route('/api/sell', methods=['POST'])
def sell_stock():
    if 'user' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.json
    username = session['user']
    ticker = data.get('ticker').upper()
    qty = int(data.get('quantity'))
    price = get_stock_price(ticker)
    total_revenue = qty * price

    if db.remove_from_portfolio(username, ticker, qty):
        db.update_balance(username, total_revenue)
        db.log_transaction(username, ticker, qty, 'SELL', price)
        return jsonify({'message': f"Sold {qty} {ticker} @ ${price}"})
    else:
        return jsonify({'error': "You do not own enough shares of that stock!"}), 400

if __name__ == '__main__':
    app.run(debug=True)