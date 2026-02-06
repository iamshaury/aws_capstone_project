import os
import time
import random
import boto3
import requests
from decimal import Decimal
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key
from flask_cors import CORS

load_dotenv()

# --- Configuration ---
class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    AWS_REGION = os.environ.get('AWS_REGION_NAME', 'us-east-1')
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
    AWS_SESSION_TOKEN = os.environ.get('AWS_SESSION_TOKEN') # Required for AWS Lab/Academy
    DYNAMODB_ENDPOINT = os.environ.get('DYNAMODB_ENDPOINT')
    AWS_SNS_TOPIC_ARN = os.environ.get('AWS_SNS_TOPIC_ARN') or 'arn:aws:sns:us-east-1:703671933325:stocker'
    ALPHA_VANTAGE_KEY = os.environ.get('ALPHA_VANTAGE_KEY') or 'RTSTRBKY4VDW8QLP'
    INITIAL_VIRTUAL_BALANCE = 100000.0

# --- App Initialization ---
# Note: Templates and Static folders are at root level relative to this file
app = Flask(__name__, template_folder='templates', static_folder='static')
app.config.from_object(Config)

# Enable CORS
CORS(app, supports_credentials=True, origins=[
    "http://localhost:5173", "http://localhost:3000"
])

# --- Database & AWS Setup ---
def get_aws_params():
    params = {'region_name': Config.AWS_REGION}
    if Config.AWS_ACCESS_KEY_ID and Config.AWS_SECRET_ACCESS_KEY:
        params['aws_access_key_id'] = Config.AWS_ACCESS_KEY_ID
        params['aws_secret_access_key'] = Config.AWS_SECRET_ACCESS_KEY
    if Config.AWS_SESSION_TOKEN:
        params['aws_session_token'] = Config.AWS_SESSION_TOKEN
    if Config.DYNAMODB_ENDPOINT:
        params['endpoint_url'] = Config.DYNAMODB_ENDPOINT
    return params

dynamodb = boto3.resource('dynamodb', **get_aws_params())

sns_params = get_aws_params()
if 'endpoint_url' in sns_params:
    del sns_params['endpoint_url']
sns = boto3.client('sns', **sns_params)

try:
    users_table = dynamodb.Table('Users')
    stocks_table = dynamodb.Table('Stocks')
    portfolio_table = dynamodb.Table('Portfolio')
    trades_table = dynamodb.Table('Trades')
    print(f"✅ DynamoDB Resource Initialized (Region: {Config.AWS_REGION})")
except Exception as e:
    print(f"❌ Failed to initialize DynamoDB resources: {e}")

# --- Helper Services ---

# Alpha Vantage / Market Data
av_cache = {}
CACHE_DURATION = 300

def get_cached_data(key):
    if key in av_cache:
        entry = av_cache[key]
        if time.time() - entry['timestamp'] < CACHE_DURATION:
            return entry['data']
    return None

def set_cached_data(key, data):
    av_cache[key] = {'data': data, 'timestamp': time.time()}

def fetch_alpha_vantage(function, symbol=None, **kwargs):
    params = {'function': function, 'apikey': Config.ALPHA_VANTAGE_KEY}
    if symbol:
        params['symbol'] = symbol
    params.update(kwargs)
    
    cache_key = f"{function}_{symbol}_{sorted(kwargs.items())}"
    cached = get_cached_data(cache_key)
    if cached: return cached

    try:
        r = requests.get('https://www.alphavantage.co/query', params=params)
        data = r.json()
        if 'Note' in data or 'Error Message' in data:
            return None
        set_cached_data(cache_key, data)
        return data
    except Exception as e:
        print(f"API Error: {e}")
        return None

def get_stock_quote(symbol):
    data = fetch_alpha_vantage('GLOBAL_QUOTE', symbol=symbol)
    if not data or 'Global Quote' not in data:
        # Fallback Mock
        return {'symbol': symbol.upper(), 'price': 150.00, 'volume': 1000000, 'change': 1.5, 'change_percent': '1.0%'}
    q = data['Global Quote']
    return {
        'symbol': q['01. symbol'],
        'price': float(q['05. price']),
        'volume': int(q['06. volume']),
        'change': float(q['09. change']),
        'change_percent': q['10. change percent'].replace('%', '')
    }

def get_market_movers():
    data = fetch_alpha_vantage('TOP_GAINERS_LOSERS')
    if not data or 'top_gainers' not in data:
        return {'gainers': [], 'losers': [], 'most_active': []}
    return {
        'gainers': data.get('top_gainers', [])[:5],
        'losers': data.get('top_losers', [])[:5],
        'most_active': data.get('most_actively_traded', [])[:5]
    }

def simulate_price(price):
    change = random.uniform(-0.02, 0.02)
    return round(price * (1 + change), 2)

def get_all_stocks():
    # Return a list of interesting stocks with live/simulated prices
    tickers = ['AAPL', 'GOOGL', 'AMZN', 'MSFT', 'TSLA', 'NFLX', 'NVDA', 'META']
    stocks = []
    for t in tickers:
        q = get_stock_quote(t)
        stocks.append({
            'symbol': t,
            'name': t, # Placeholder
            'currentPrice': q['price'],
            'change': q['change']
        })
    return stocks

# Auth Services
def register_user(username, password, email=None):
    try:
        if 'Item' in users_table.get_item(Key={'username': username}):
            return None
        hashed = generate_password_hash(password)
        new_user = {
            'username': username, 
            'passwordHash': hashed, 
            'email': email, 
            'role': 'USER', 
            'virtualBalance': Decimal(str(Config.INITIAL_VIRTUAL_BALANCE))
        }
        users_table.put_item(Item=new_user)
        return new_user
    except ClientError as e:
        print(f"Register Error: {e}")
        return None

def authenticate_user(username, password):
    try:
        resp = users_table.get_item(Key={'username': username})
        if 'Item' not in resp: return None
        user = resp['Item']
        if check_password_hash(user['passwordHash'], password):
            return user
        return None
    except Exception:
        return None

def get_user_by_username(username):
    try:
        resp = users_table.get_item(Key={'username': username})
        return resp.get('Item')
    except Exception:
        return None

# Portfolio Services
def get_portfolio(username):
    try:
        resp = portfolio_table.query(KeyConditionExpression=Key('userId').eq(username))
        items = resp.get('Items', [])
        portfolio = []
        for item in items:
            symbol = item['symbol']
            qty = float(item['quantity'])
            avg = float(item['avgBuyPrice'])
            # Live price check
            quote = get_stock_quote(symbol)
            cur_price = quote['price']
            val = qty * cur_price
            portfolio.append({
                'ticker': symbol,
                'qty': qty,
                'price': avg,
                'current_price': cur_price,
                'market_value': val,
                'gain_loss': val - (qty * avg)
            })
        return portfolio
    except Exception:
        return []

def get_portfolio_value(username):
    return sum(i['market_value'] for i in get_portfolio(username))

# Trade Services
def publish_trade_notification(user, type, symbol, qty, price):
    try:
        msg = f"CONFIRMATION: {user} {type} {qty} shares of {symbol} at ${price:.2f}"
        sns.publish(TopicArn=Config.AWS_SNS_TOPIC_ARN, Subject=f"Trade Alert: {type} {symbol}", Message=msg)
    except Exception as e:
        print(f"SNS Error: {e}")

def buy_stock(username, symbol, quantity):
    user = get_user_by_username(username)
    if not user: raise Exception("User not found")
    
    quote = get_stock_quote(symbol)
    price = float(quote['price'])
    cost = price * quantity
    balance = float(user['virtualBalance'])
    
    if balance < cost: raise Exception("Insufficient balance")
    
    # Update Balance
    new_bal = balance - cost
    users_table.update_item(
        Key={'username': username},
        UpdateExpression="set virtualBalance = :b",
        ExpressionAttributeValues={':b': Decimal(str(new_bal))}
    )
    
    # Update Portfolio
    try:
        # Check if exists
        resp = portfolio_table.get_item(Key={'userId': username, 'symbol': symbol})
        if 'Item' in resp:
            old_qty = float(resp['Item']['quantity'])
            old_avg = float(resp['Item']['avgBuyPrice'])
            new_qty = old_qty + quantity
            new_avg = ((old_qty * old_avg) + cost) / new_qty
            portfolio_table.update_item(
                Key={'userId': username, 'symbol': symbol},
                UpdateExpression="set quantity = :q, avgBuyPrice = :p",
                ExpressionAttributeValues={':q': Decimal(str(new_qty)), ':p': Decimal(str(new_avg))}
            )
        else:
            portfolio_table.put_item(Item={
                'userId': username, 'symbol': symbol, 
                'quantity': Decimal(str(quantity)), 'avgBuyPrice': Decimal(str(price))
            })
    except Exception as e:
        print(f"Portfolio Update Error: {e}")
        # Ideally rollback balance here, but keeping simple
    
    # Log Trade
    ts = datetime.now().isoformat()
    trades_table.put_item(Item={
        'userId': username, 'timestamp': ts, 'user': username, 'symbol': symbol,
        'type': 'BUY', 'quantity': Decimal(str(quantity)), 'price': Decimal(str(price)),
        'total_amount': Decimal(str(cost)), 'time': ts
    })
    
    publish_trade_notification(username, 'BOUGHT', symbol, quantity, price)

def sell_stock(username, symbol, quantity):
    user = get_user_by_username(username)
    # Check holding
    resp = portfolio_table.get_item(Key={'userId': username, 'symbol': symbol})
    if 'Item' not in resp: raise Exception("Not owned")
    
    cur_qty = float(resp['Item']['quantity'])
    if cur_qty < quantity: raise Exception("Insufficient shares")
    
    quote = get_stock_quote(symbol)
    price = float(quote['price'])
    revenue = price * quantity
    
    # Update Balance
    new_bal = float(user['virtualBalance']) + revenue
    users_table.update_item(
        Key={'username': username},
        UpdateExpression="set virtualBalance = :b",
        ExpressionAttributeValues={':b': Decimal(str(new_bal))}
    )
    
    # Update Portfolio
    new_qty = cur_qty - quantity
    if new_qty <= 0:
        portfolio_table.delete_item(Key={'userId': username, 'symbol': symbol})
    else:
        portfolio_table.update_item(
            Key={'userId': username, 'symbol': symbol},
            UpdateExpression="set quantity = :q",
            ExpressionAttributeValues={':q': Decimal(str(new_qty))}
        )
        
    # Log & Notify
    ts = datetime.now().isoformat()
    trades_table.put_item(Item={
        'userId': username, 'timestamp': ts, 'user': username, 'symbol': symbol,
        'type': 'SELL', 'quantity': Decimal(str(quantity)), 'price': Decimal(str(price)),
        'total_amount': Decimal(str(revenue)), 'time': ts
    })
    publish_trade_notification(username, 'SOLD', symbol, quantity, price)


# --- Routes ---

@app.route('/')
def index():
    if 'user' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    
    username = request.form.get('username') or request.json.get('username')
    password = request.form.get('password') or request.json.get('password')
    
    user = authenticate_user(username, password)
    if user:
        session['user'] = user['username']
        session['role'] = user['role']
        flash('Login successful!', 'success')
        return redirect(url_for('dashboard'))
    
    flash('Invalid credentials', 'error')
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
@app.route('/register', methods=['GET', 'POST'])
def signup():
    if request.method == 'GET':
        return render_template('register.html')
    
    username = request.form.get('username') or request.json.get('username')
    password = request.form.get('password') or request.json.get('password')
    email = request.form.get('email') or request.json.get('email')
    
    if not username or not password:
        flash('Missing fields', 'error')
        return redirect(url_for('signup'))

    user = register_user(username, password, email)
    if user:
        flash('Account created! Please login.', 'success')
        return redirect(url_for('login'))
        
    flash('Username taken', 'error')
    return redirect(url_for('signup'))

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    flash('Logged out', 'success')
    return redirect(url_for('login'))

@app.route('/dashboard')
def dashboard():
    if 'user' not in session: return redirect(url_for('login'))
    user = get_user_by_username(session['user'])
    stocks = get_all_stocks()
    return render_template('dashboard.html', user=user, stocks=stocks)

@app.route('/portfolio')
def portfolio():
    if 'user' not in session: return redirect(url_for('login'))
    p = get_portfolio(session['user'])
    val = get_portfolio_value(session['user'])
    return render_template('portfolio.html', portfolio=p, total_value=val)

@app.route('/buy', methods=['POST'])
def buy():
    if 'user' not in session: return redirect(url_for('login'))
    try:
        # Support JSON or Form
        data = request.json if request.is_json else request.form
        sym = data.get('symbol') or data.get('ticker')
        qty = int(data.get('quantity'))
        
        buy_stock(session['user'], sym, qty)
        flash(f"Bought {qty} {sym}", 'success')
    except Exception as e:
        flash(str(e), 'error')
    
    return redirect(url_for('dashboard'))

@app.route('/sell', methods=['POST'])
def sell():
    if 'user' not in session: return redirect(url_for('login'))
    try:
        data = request.json if request.is_json else request.form
        sym = data.get('symbol') or data.get('ticker')
        qty = int(data.get('quantity'))
        
        sell_stock(session['user'], sym, qty)
        flash(f"Sold {qty} {sym}", 'success')
    except Exception as e:
        flash(str(e), 'error')
        
    # Return to where we likely came from, or portfolio
    return redirect(url_for('portfolio'))

@app.route('/api/search')
def search():
    q = request.args.get('q')
    if not q: return jsonify([])
    # Simple search wrapper
    return jsonify(fetch_alpha_vantage('SYMBOL_SEARCH', keywords=q) or [])

# Entry Point
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
