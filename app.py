from flask import Flask, render_template, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
import random

app = Flask(__name__)
app.secret_key = 'stocker_secret_key' 

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
            'time': datetime.datetime.now()
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

@app.route('/')
def index():
    if 'user' in session:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')

    username = request.form['username']
    password = request.form['password']
    
    user = db.get_user(username)
    if user and check_password_hash(user['password'], password):
        session['user'] = username
        session['role'] = user['role']
        
        if user['role'] == 'ADMIN':
            return redirect(url_for('dashboard_admin'))
        return redirect(url_for('dashboard'))
    
    flash("Invalid username or password")
    return redirect(url_for('index'))

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = generate_password_hash(request.form['password'])
        
        if db.create_user(username, password):
            flash("Account created! Please login.")
            return redirect(url_for('index'))
        else:
            flash("Username already exists!")
            
    return render_template('signup.html')

@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect(url_for('index'))
    
    # Simple role check
    if session.get('role') == 'ADMIN':
        return redirect(url_for('dashboard_admin'))

    username = session['user']
    user_data = db.get_user(username)
    if not user_data:
        # DB reset or invalid user, clear session
        session.pop('user', None)
        return redirect(url_for('index'))

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

    return render_template('dashboard_trader.html', 
                           user=user_data, 
                           portfolio=enriched_portfolio, 
                           username=username,
                           total_value=total_portfolio_value)

@app.route('/admin')
def dashboard_admin():
    if 'user' not in session or session.get('role') != 'ADMIN':
        flash("Unauthorized access!")
        return redirect(url_for('index'))
        
    transactions = db.get_all_transactions()
    # Sort by time desc
    transactions.sort(key=lambda x: x['time'], reverse=True)
    
    return render_template('dashboard_admin.html', transactions=transactions, username=session['user'])

@app.route('/buy', methods=['GET', 'POST'])
def buy_stock():
    if 'user' not in session:
        return redirect(url_for('index'))
        
    if request.method == 'POST':
        username = session['user']
        ticker = request.form['ticker'].upper()
        qty = int(request.form['quantity'])
        price = get_stock_price(ticker)
        total_cost = qty * price
        
        user = db.get_user(username)
        if not user:
             session.pop('user', None)
             return redirect(url_for('index'))
        
        if user['balance'] >= total_cost:
            db.update_balance(username, -total_cost)
            db.add_to_portfolio(username, ticker, qty, price)
            db.log_transaction(username, ticker, qty, 'BUY', price)
            flash(f"Bought {qty} {ticker} @ ${price}")
        else:
            flash("Insufficient funds!")
        return redirect(url_for('dashboard'))
        
    return render_template('buy_stock.html')

@app.route('/sell', methods=['GET', 'POST'])
def sell_stock():
    if 'user' not in session:
        return redirect(url_for('index'))
        
    username = session['user']
    user = db.get_user(username)
    if not user:
        session.pop('user', None)
        return redirect(url_for('index'))

    if request.method == 'POST':
        ticker = request.form['ticker'].upper()
        qty = int(request.form['quantity'])
        price = get_stock_price(ticker)
        total_revenue = qty * price
        
        if db.remove_from_portfolio(username, ticker, qty):
            db.update_balance(username, total_revenue)
            db.log_transaction(username, ticker, qty, 'SELL', price)
            flash(f"Sold {qty} {ticker} @ ${price}")
        else:
            flash("You do not own enough shares of that stock!")
        return redirect(url_for('dashboard'))

    return render_template('sell_stock.html', portfolio=db.get_portfolio(username))

@app.route('/logout')
def logout():
    session.pop('user', None)
    session.pop('role', None)
    return redirect(url_for('index'))

@app.route('/service/<int:service_id>')
def service_detail(service_id):
    if 'user' not in session: # Optional: require login for services
        pass
    template_name = f'service-details-{service_id}.html'
    return render_template(template_name)

if __name__ == '__main__':
    app.run(debug=True)