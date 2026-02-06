from ..database import users_table, portfolio_table
from ..services.alpha_vantage_service import get_stock_quote
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
from decimal import Decimal

def get_portfolio(username):
    # In this schema, we assume userId is the username
    
    try:
        response = users_table.get_item(Key={'username': username})
        if 'Item' not in response:
            return []
        
        # Query portfolio by userId (username)
        port_response = portfolio_table.query(
            KeyConditionExpression=Key('userId').eq(username)
        )
        items = port_response.get('Items', [])
        
        # Enrichment
        enriched = []
        
        for item in items:
            stock = get_stock_quote(item['symbol'])
            current_price = 0.0
            if stock:
                 current_price = float(stock['price'])
            else:
                 # Fallback
                 current_price = float(item['avgBuyPrice'])

            qty = float(item['quantity'])
            avg_buy = float(item['avgBuyPrice'])
            market_value = qty * current_price
            
            enriched_item = {
                'ticker': item['symbol'],
                'qty': qty,
                'price': avg_buy, 
                'current_price': current_price,
                'market_value': market_value,
                'gain_loss': market_value - (qty * avg_buy)
            }
            enriched.append(enriched_item)
            
        return enriched
    except ClientError as e:
        print(f"Error fetching portfolio: {e}")
        return []

def get_portfolio_value(username):
    port = get_portfolio(username)
    return sum(item['market_value'] for item in port)
