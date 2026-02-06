from datetime import datetime
from ..database import users_table, portfolio_table, trades_table
from ..services.alpha_vantage_service import get_stock_quote
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key
from decimal import Decimal

def buy_stock(username, symbol, quantity):
    try:
        # 1. Get User & Check Balance
        user_response = users_table.get_item(Key={'username': username})
        if 'Item' not in user_response:
            raise Exception("User not found")
        
        user = user_response['Item']
        
        stock = get_stock_quote(symbol) # Use Alpha Vantage / Mock
        if not stock:
            # Fallback
            stock = {'price': 150.0}
            
        current_price = float(stock['price'])
        total_cost = current_price * quantity
        
        # Balance handling (Decimal)
        balance = float(user['virtualBalance'])
        
        if balance < total_cost:
            raise Exception("Insufficient balance")
            
        # 2. Deduct Balance
        new_balance = balance - total_cost
        users_table.update_item(
            Key={'username': username},
            UpdateExpression="set virtualBalance = :b",
            ExpressionAttributeValues={':b': Decimal(str(new_balance))}
        )
        
        # 3. Update Portfolio
        # Check if holding exists
        # Portfolio PK: userId (username), SK: symbol
        holding_response = portfolio_table.get_item(Key={'userId': username, 'symbol': symbol})
        
        if 'Item' in holding_response:
            existing_holding = holding_response['Item']
            current_qty = float(existing_holding['quantity'])
            current_avg = float(existing_holding['avgBuyPrice'])
            
            new_qty = current_qty + quantity
            new_avg = ((current_qty * current_avg) + total_cost) / new_qty
            
            portfolio_table.update_item(
                Key={'userId': username, 'symbol': symbol},
                UpdateExpression="set quantity = :q, avgBuyPrice = :a",
                ExpressionAttributeValues={
                    ':q': Decimal(str(new_qty)),
                    ':a': Decimal(str(new_avg))
                }
            )
        else:
            portfolio_table.put_item(Item={
                'userId': username,
                'symbol': symbol,
                'quantity': Decimal(str(quantity)),
                'avgBuyPrice': Decimal(str(current_price))
            })
            
        # 4. Log Trade
        # Trades PK: userId, SK: timestamp
        timestamp = datetime.now().isoformat()
        trades_table.put_item(Item={
            'userId': username,
            'timestamp': timestamp, # Sort Key
            'user': username,
            'symbol': symbol,
            'ticker': symbol,
            'type': 'BUY',
            'quantity': Decimal(str(quantity)),
            'qty': Decimal(str(quantity)),
            'total_amount': Decimal(str(total_cost)),
            'balance_after_trade': Decimal(str(new_balance)),
            'price': Decimal(str(current_price)),
            'time': timestamp
        })
        
        return True
    except Exception as e:
        print(f"Buy Stock Error: {e}")
        raise e

def sell_stock(username, symbol, quantity):
    try:
        # 1. Get User
        user_response = users_table.get_item(Key={'username': username})
        if 'Item' not in user_response:
            raise Exception("User not found")
        
        user = user_response['Item']
        
        # 2. Check Holding
        holding_response = portfolio_table.get_item(Key={'userId': username, 'symbol': symbol})
        if 'Item' not in holding_response:
             raise Exception("Insufficient shares")
             
        existing_holding = holding_response['Item']
        current_qty = float(existing_holding['quantity'])
        
        if current_qty < quantity:
            raise Exception("Insufficient shares")
            
        # 3. Get Price
        stock = get_stock_quote(symbol)
        if not stock:
            stock = {'price': 150.0}
            
        current_price = float(stock['price'])
        total_revenue = current_price * quantity
        
        # 4. Add Balance
        balance = float(user['virtualBalance'])
        new_balance = balance + total_revenue
        
        users_table.update_item(
            Key={'username': username},
            UpdateExpression="set virtualBalance = :b",
            ExpressionAttributeValues={':b': Decimal(str(new_balance))}
        )
        
        # 5. Update Portfolio
        new_qty = current_qty - quantity
        if new_qty == 0:
            portfolio_table.delete_item(Key={'userId': username, 'symbol': symbol})
        else:
            portfolio_table.update_item(
                Key={'userId': username, 'symbol': symbol},
                UpdateExpression="set quantity = :q",
                ExpressionAttributeValues={':q': Decimal(str(new_qty))}
            )
            
        # 6. Log Trade
        timestamp = datetime.now().isoformat()
        trades_table.put_item(Item={
            'userId': username,
            'timestamp': timestamp,
            'user': username,
            'symbol': symbol,
            'ticker': symbol,
            'type': 'SELL',
            'quantity': Decimal(str(quantity)),
            'qty': Decimal(str(quantity)),
            'total_amount': Decimal(str(total_revenue)),
            'balance_after_trade': Decimal(str(new_balance)),
            'price': Decimal(str(current_price)),
            'time': timestamp
        })
        
        return True
    except Exception as e:
        print(f"Sell Stock Error: {e}")
        raise e

def get_all_trades():
    try:
        # Scan trades table (admin feature)
        response = trades_table.scan()
        return response.get('Items', [])
    except ClientError as e:
        print(f"Error fetching trades: {e}")
        return []
