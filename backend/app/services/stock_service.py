import random
from ..database import stocks_table
from .price_simulator import simulate_price
from decimal import Decimal
from botocore.exceptions import ClientError

# Seed stocks if empty
def seed_stocks():
    try:
        # Check if empty (limit 1 for efficiency)
        if stocks_table.scan(Limit=1)['Count'] == 0:
            seed_stocks_list = [
                {'symbol': 'AAPL', 'name': 'Apple Inc', 'currentPrice': Decimal('150.0')},
                {'symbol': 'GOOGL', 'name': 'Alphabet Inc', 'currentPrice': Decimal('2800.0')},
                {'symbol': 'MSFT', 'name': 'Microsoft Corp', 'currentPrice': Decimal('300.0')},
                {'symbol': 'AMZN', 'name': 'Amazon.com Inc', 'currentPrice': Decimal('3400.0')},
                {'symbol': 'TSLA', 'name': 'Tesla Inc', 'currentPrice': Decimal('700.0')},
            ]
            for s in seed_stocks_list:
                stocks_table.put_item(Item=s)
            print("✅ Seeded stock data")
    except Exception as e:
         print(f"⚠️ Failed to seed stocks: {e}")

# Call separately, not at import time to avoid breaking app if DB is down
# seed_stocks()

def get_stock(symbol):
    try:
        response = stocks_table.get_item(Key={'symbol': symbol})
        stock = response.get('Item')
        if stock:
            # Simulate live price update on fetch
            current_price = float(stock['currentPrice'])
            new_price = simulate_price(current_price)
            
            stocks_table.update_item(
                Key={'symbol': symbol},
                UpdateExpression="set currentPrice = :p",
                ExpressionAttributeValues={':p': Decimal(str(new_price))}
            )
            stock['currentPrice'] = new_price # Return float to app
        return stock
    except ClientError as e:
        print(f"Error fetching stock: {e}")
        return None

def get_all_stocks():
    try:
        response = stocks_table.scan()
        stocks = response.get('Items', [])
        for stock in stocks:
            # Simulate update
            current_price = float(stock['currentPrice'])
            new_price = simulate_price(current_price)
            
            stocks_table.update_item(
                Key={'symbol': stock['symbol']},
                UpdateExpression="set currentPrice = :p",
                ExpressionAttributeValues={':p': Decimal(str(new_price))}
            )
            stock['currentPrice'] = new_price
        return stocks
    except ClientError as e:
        print(f"Error fetching all stocks: {e}")
        return []
