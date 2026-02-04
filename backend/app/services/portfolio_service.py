from ..database import db
from ..services.alpha_vantage_service import get_stock_quote

def get_portfolio(username):
    # In this schema, portfolio items don't have username, they link via ID
    # but for simplicity in this mock, we will query by username if we stored it,
    # OR we need to fetch user first.
    # The requirement says: portfolio "userId": ObjectId.
    
    user = db.users.find_one({'username': username})
    if not user:
        return []

    # Using string ID for mock match
    user_id = user['_id']
    items = db.portfolio.find({'userId': user_id})
    
    # Enrichment
    enriched = []
    total_val = 0
    
    for item in items:
        stock = get_stock_quote(item['symbol'])
        current_price = 0
        if stock:
             current_price = float(stock['price'])
        else:
             # Fallback if both API and Mock fail (unlikely)
             current_price = item['avgBuyPrice']

        market_value = item['quantity'] * current_price
        
        enriched_item = {
            'ticker': item['symbol'],
            'qty': item['quantity'],
            'price': item['avgBuyPrice'], # Using standard field name for frontend compatibility
            'current_price': current_price,
            'market_value': market_value,
            'gain_loss': market_value - (item['quantity'] * item['avgBuyPrice'])
        }
        enriched.append(enriched_item)
        
    return enriched

def get_portfolio_value(username):
    port = get_portfolio(username)
    return sum(item['market_value'] for item in port)
