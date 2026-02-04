import random
from ..database import db
from .price_simulator import simulate_price

# Seed stocks if empty
# Seed stocks if empty
def seed_stocks():
    try:
        if not db.stocks.find_one({}):
            seed_stocks_list = [
                {'symbol': 'AAPL', 'name': 'Apple Inc', 'currentPrice': 150.0},
                {'symbol': 'GOOGL', 'name': 'Alphabet Inc', 'currentPrice': 2800.0},
                {'symbol': 'MSFT', 'name': 'Microsoft Corp', 'currentPrice': 300.0},
                {'symbol': 'AMZN', 'name': 'Amazon.com Inc', 'currentPrice': 3400.0},
                {'symbol': 'TSLA', 'name': 'Tesla Inc', 'currentPrice': 700.0},
            ]
            for s in seed_stocks_list:
                db.stocks.insert_one(s)
            print("✅ Seeded stock data")
    except Exception as e:
         print(f"⚠️ Failed to seed stocks: {e}")

# Call separately, not at import time to avoid breaking app if DB is down
# seed_stocks()

def get_stock(symbol):
    stock = db.stocks.find_one({'symbol': symbol})
    if stock:
        # Simulate live price update on fetch
        new_price = simulate_price(stock['currentPrice'])
        db.stocks.update_one({'symbol': symbol}, {'$set': {'currentPrice': new_price}})
        stock['currentPrice'] = new_price
    return stock

def get_all_stocks():
    stocks = list(db.stocks.find({}))
    for stock in stocks:
        # Simulate update
        new_price = simulate_price(stock['currentPrice'])
        db.stocks.update_one({'symbol': stock['symbol']}, {'$set': {'currentPrice': new_price}})
        stock['currentPrice'] = new_price
    return stocks
