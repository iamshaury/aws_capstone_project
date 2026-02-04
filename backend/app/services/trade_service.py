from datetime import datetime
from ..database import db
from ..services.alpha_vantage_service import get_stock_quote

def buy_stock(username, symbol, quantity):
    user = db.users.find_one({'username': username})
    if not user:
        raise Exception("User not found")
        
    stock = get_stock_quote(symbol) # Use Alpha Vantage / Mock
    if not stock:
        # Fallback just in case even mock fails (unlikely)
        stock = {'price': 150.0} 
        
    current_price = float(stock['price'])
    total_cost = current_price * quantity
    
    if user['virtualBalance'] < total_cost:
        raise Exception("Insufficient balance")
        
    # Transaction
    # 1. Deduct Balance
    db.users.update_one(
        {'_id': user['_id']},
        {'$inc': {'virtualBalance': -total_cost}}
    )
    
    # 2. Update Portfolio
    user_id = user['_id']
    existing_holding = db.portfolio.find_one({'userId': user_id, 'symbol': symbol})
    
    if existing_holding:
        # Calculate new avg price
        current_qty = existing_holding['quantity']
        current_avg = existing_holding['avgBuyPrice']
        new_qty = current_qty + quantity
        new_avg = ((current_qty * current_avg) + total_cost) / new_qty
        
        db.portfolio.update_one(
            {'_id': existing_holding['_id']},
            {'$set': {'quantity': new_qty, 'avgBuyPrice': new_avg}}
        )
    else:
        db.portfolio.insert_one({
            'userId': user_id,
            'symbol': symbol,
            'quantity': quantity,
            'avgBuyPrice': current_price
        })
        
    # 3. Log Trade
    db.trades.insert_one({
        'userId': user_id,
        'user': username, # Added for Admin text display
        'symbol': symbol, 
        'ticker': symbol, # For frontend compatibility
        'type': 'BUY',
        'quantity': quantity,
        'qty': quantity, # Frontend compatibility
        'total_amount': total_cost,
        'balance_after_trade': user['virtualBalance'] - total_cost,
        'price': current_price,
        'time': datetime.now().isoformat()
    })
    
    return True

def sell_stock(username, symbol, quantity):
    user = db.users.find_one({'username': username})
    if not user:
        raise Exception("User not found")
        
    user_id = user['_id']
    existing_holding = db.portfolio.find_one({'userId': user_id, 'symbol': symbol})
    
    if not existing_holding or existing_holding['quantity'] < quantity:
        raise Exception("Insufficient shares")
        
    stock = get_stock_quote(symbol)
    if not stock:
        stock = {'price': 150.0}
        
    current_price = float(stock['price'])
    total_revenue = current_price * quantity
    
    # 1. Add Balance
    db.users.update_one(
        {'_id': user_id},
        {'$inc': {'virtualBalance': total_revenue}}
    )
    
    # 2. Update Portfolio
    new_qty = existing_holding['quantity'] - quantity
    if new_qty == 0:
        db.portfolio.delete_one({'_id': existing_holding['_id']})
    else:
        db.portfolio.update_one(
            {'_id': existing_holding['_id']},
            {'$set': {'quantity': new_qty}}
        )
        
    # 3. Log Trade
    db.trades.insert_one({
        'userId': user_id,
        'user': username,
        'symbol': symbol,
        'ticker': symbol,
        'type': 'SELL',
        'quantity': quantity,
        'qty': quantity,
        'total_amount': total_revenue,
        'balance_after_trade': user['virtualBalance'] + total_revenue,
        'price': current_price,
        'time': datetime.now().isoformat()
    })
    
    return True

def get_all_trades():
    return db.trades.find({})
