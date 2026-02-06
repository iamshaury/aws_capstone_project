from flask import Blueprint, request, jsonify, session, flash, redirect, url_for
from ..services.trade_service import buy_stock, sell_stock

trade_bp = Blueprint('trade', __name__)

@trade_bp.route('/buy', methods=['POST'])
def buy():
    if 'user' not in session:
        return redirect(url_for('auth.login'))
    
    # Handle Form or JSON
    if request.is_json:
        data = request.json
        ticker = data.get('ticker')
        qty = int(data.get('quantity'))
    else:
        ticker = request.form.get('symbol')
        qty = int(request.form.get('quantity'))

    try:
        buy_stock(session['user'], ticker, qty)
        flash(f"Sueccessfully bought {qty} shares of {ticker}", "success")
    except Exception as e:
        flash(str(e), "error")
        
    return redirect(url_for('stock.dashboard'))

@trade_bp.route('/sell', methods=['POST'])
def sell():
    if 'user' not in session:
        return redirect(url_for('auth.login'))
    
    if request.is_json:
        data = request.json
        ticker = data.get('ticker')
        qty = int(data.get('quantity'))
    else:
        ticker = request.form.get('symbol')
        qty = int(request.form.get('quantity'))

    try:
        sell_stock(session['user'], ticker, qty)
        flash(f"Successfully sold {qty} shares of {ticker}", "success")
    except Exception as e:
        flash(str(e), "error")
        
    return redirect(url_for('portfolio.portfolio_view'))
