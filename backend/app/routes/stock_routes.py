from flask import Blueprint, jsonify, request, render_template, session, redirect, url_for
from ..services.stock_service import get_all_stocks
from ..services.auth_service import get_user_by_username
from ..services.alpha_vantage_service import (
    search_stocks, get_stock_quote, get_company_overview, 
    get_stock_history, get_market_movers
)

stock_bp = Blueprint('stock', __name__) # Singular 'stock' to match usage

@stock_bp.route('/dashboard', methods=['GET'])
def dashboard():
    if 'user' not in session:
        return redirect(url_for('auth.login'))
        
    user = get_user_by_username(session['user'])
    stocks = get_all_stocks()
    return render_template('dashboard.html', user=user, stocks=stocks)

@stock_bp.route('/search', methods=['GET'])
def search():
    query = request.args.get('q')
    if not query:
        return jsonify([])
    results = search_stocks(query)
    return jsonify(results)

@stock_bp.route('/explore', methods=['GET'])
def explore():
    movers = get_market_movers()
    return jsonify(movers)

@stock_bp.route('/<symbol>', methods=['GET'])
def stock_detail(symbol):
    quote = get_stock_quote(symbol)
    if not quote:
        # Fallback to mock if real fails or not found?
        # For professional app, simpler to return 404 or partial data.
        return jsonify({'error': 'Stock not found or API limit reached'}), 404
    
    overview = get_company_overview(symbol)
    
    # Merge data
    response = {
        'quote': quote,
        'overview': overview
    }
    return jsonify(response)

@stock_bp.route('/<symbol>/history', methods=['GET'])
def stock_history(symbol):
    history = get_stock_history(symbol)
    return jsonify(history)

@stock_bp.route('/price/<ticker>', methods=['GET'])
def get_price(ticker):
    # Used by dashboard/portfolio for live updates
    quote = get_stock_quote(ticker)
    if quote:
        return jsonify({'price': quote['price'], 'volume': quote['volume']})
    else:
        # Fallback to mock logic if needed or error
        return jsonify({'error': 'Price unavailable'}), 404
