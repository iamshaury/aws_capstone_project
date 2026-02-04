import requests
import time
from ..config import Config

API_KEY = Config.ALPHA_VANTAGE_KEY
BASE_URL = 'https://www.alphavantage.co/query'

# Simple in-memory cache: { 'key': { 'data': ..., 'timestamp': ... } }
cache = {}
CACHE_DURATION = 300 # 5 minutes

def get_cached_data(key):
    if key in cache:
        entry = cache[key]
        if time.time() - entry['timestamp'] < CACHE_DURATION:
            return entry['data']
    return None

def set_cached_data(key, data):
    cache[key] = {
        'data': data,
        'timestamp': time.time()
    }

def fetch_alpha_vantage(function, symbol=None, **kwargs):
    params = {'function': function, 'apikey': API_KEY}
    if symbol:
        params['symbol'] = symbol
    params.update(kwargs)
    
    # Generate cache key from params
    cache_key = f"{function}_{symbol}_{sorted(kwargs.items())}"
    
    cached = get_cached_data(cache_key)
    if cached:
        return cached

    try:
        response = requests.get(BASE_URL, params=params)
        data = response.json()
        
        # Check for API limit or errors
        if 'Note' in data or 'Error Message' in data:
            print(f"Alpha Vantage Error/Limit: {data}")
            return None
            
        set_cached_data(cache_key, data)
        return data
    except Exception as e:
        print(f"Error fetching from Alpha Vantage: {e}")
        return None

def search_stocks(query):
    data = fetch_alpha_vantage('SYMBOL_SEARCH', keywords=query)
    
    # Check if data is valid
    if data and 'bestMatches' in data:
        results = []
        for match in data['bestMatches']:
            results.append({
                'symbol': match['1. symbol'],
                'name': match['2. name'],
                'type': match['3. type'],
                'region': match['4. region']
            })
        return results

    # Mock Fallback if API fails or limit reached
    print(f"Search API limit/error for {query}, using mock.")
    q = query.upper()
    mock_db = [
        {'symbol': 'AAPL', 'name': 'Apple Inc', 'type': 'Equity', 'region': 'United States'},
        {'symbol': 'TSLA', 'name': 'Tesla Inc', 'type': 'Equity', 'region': 'United States'},
        {'symbol': 'NVDA', 'name': 'NVIDIA Corp', 'type': 'Equity', 'region': 'United States'},
        {'symbol': 'AMZN', 'name': 'Amazon.com Inc', 'type': 'Equity', 'region': 'United States'},
        {'symbol': 'MSFT', 'name': 'Microsoft Corp', 'type': 'Equity', 'region': 'United States'},
        {'symbol': 'GOOGL', 'name': 'Alphabet Inc', 'type': 'Equity', 'region': 'United States'},
        {'symbol': 'META', 'name': 'Meta Platforms Inc', 'type': 'Equity', 'region': 'United States'},
        {'symbol': 'NFLX', 'name': 'Netflix Inc', 'type': 'Equity', 'region': 'United States'},
        {'symbol': 'AMD', 'name': 'Advanced Micro Devices Inc', 'type': 'Equity', 'region': 'United States'}
    ]
    
    return [s for s in mock_db if q in s['symbol']]

def get_stock_quote(symbol):
    data = fetch_alpha_vantage('GLOBAL_QUOTE', symbol=symbol)
    
    # Fallback if data is missing OR Global Quote is missing
    if not data or 'Global Quote' not in data or not data.get('Global Quote'):
         return {
            'symbol': symbol.upper(),
            'price': 150.00,
            'change': 2.50,
            'change_percent': '1.69',
            'volume': 1000000,
            'previous_close': 147.50
        }
    
    q = data.get('Global Quote')
        
    return {
        'symbol': q.get('01. symbol'),
        'price': float(q.get('05. price', 0)),
        'change': float(q.get('09. change', 0)),
        'change_percent': q.get('10. change percent', '0%').replace('%', ''),
        'volume': int(q.get('06. volume', 0)),
        'previous_close': float(q.get('08. previous close', 0))
    }

def get_company_overview(symbol):
    data = fetch_alpha_vantage('OVERVIEW', symbol=symbol)
    if not data or 'Symbol' not in data:
        # Mock fallback
        return {
            'Symbol': symbol.upper(),
            'Name': f"{symbol.upper()} Corp (Mock)",
            'Description': "This is a mock description because the API limit was reached. In a real scenario, this would be the company description.",
            'Exchange': 'NASDAQ',
            'Sector': 'Technology',
            'Industry': 'Consumer Electronics',
            'MarketCapitalization': '2000000000000',
            'PERatio': '30.5',
            'DividendYield': '0.005',
            '52WeekHigh': '180.00',
            '52WeekLow': '120.00'
        }
    return data

def get_stock_history(symbol):
    # TIME_SERIES_DAILY
    data = fetch_alpha_vantage('TIME_SERIES_DAILY', symbol=symbol)
    if not data or 'Time Series (Daily)' not in data:
        # Mock history
        mock_history = []
        import datetime
        today = datetime.date.today()
        base_price = 150.0
        for i in range(30):
            d = today - datetime.timedelta(days=i)
            # Random walk
            import random
            base_price += random.uniform(-5, 5)
            mock_history.append({
                'date': d.strftime('%Y-%m-%d'),
                'close': round(base_price, 2),
                'volume': random.randint(1000000, 5000000)
            })
        return mock_history
    
    history = []
    ts = data['Time Series (Daily)']
    # Limit to last 30 days to save space/bandwidth
    sorted_dates = sorted(ts.keys(), reverse=True)[:30]
    
    for date in sorted_dates:
        entry = ts[date]
        history.append({
            'date': date,
            'close': float(entry['4. close']),
            'volume': int(entry['5. volume'])
        })
    return history # Returns list sorted desc (latest first)

def get_market_movers():
    data = fetch_alpha_vantage('TOP_GAINERS_LOSERS')
    if not data or 'top_gainers' not in data:
        # Fallback to mock data if API limit reached
        return {
            'gainers': [
                {'ticker': 'AAPL', 'price': '150.00', 'change_amount': '2.50', 'change_percentage': '1.6%'},
                {'ticker': 'NVDA', 'price': '420.00', 'change_amount': '12.00', 'change_percentage': '2.9%'},
                {'ticker': 'TSLA', 'price': '240.00', 'change_amount': '5.00', 'change_percentage': '2.1%'}
            ],
            'losers': [
                {'ticker': 'NFLX', 'price': '350.00', 'change_amount': '-4.00', 'change_percentage': '-1.1%'},
                {'ticker': 'META', 'price': '290.00', 'change_amount': '-3.50', 'change_percentage': '-1.2%'},
                {'ticker': 'AMZN', 'price': '130.00', 'change_amount': '-1.20', 'change_percentage': '-0.9%'}
            ],
            'most_active': [
                {'ticker': 'AMD', 'price': '105.00', 'change_amount': '1.00', 'change_percentage': '0.9%'},
                {'ticker': 'F', 'price': '12.00', 'change_amount': '0.10', 'change_percentage': '0.8%'},
                {'ticker': 'BAC', 'price': '32.00', 'change_amount': '-0.15', 'change_percentage': '-0.4%'}
            ]
        }
    
    return {
        'gainers': data.get('top_gainers', [])[:5],
        'losers': data.get('top_losers', [])[:5],
        'most_active': data.get('most_actively_traded', [])[:5]
    }
