from flask import Blueprint, request, jsonify, session
from ..services.trade_service import buy_stock, sell_stock

trade_bp = Blueprint('trades', __name__)

@trade_bp.route('/buy', methods=['POST'])
def buy():
    if 'user' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    try:
        buy_stock(session['user'], data.get('ticker'), int(data.get('quantity')))
        return jsonify({'message': f"Bought {data.get('quantity')} of {data.get('ticker')}"})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@trade_bp.route('/sell', methods=['POST'])
def sell():
    if 'user' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    try:
        sell_stock(session['user'], data.get('ticker'), int(data.get('quantity')))
        return jsonify({'message': f"Sold {data.get('quantity')} of {data.get('ticker')}"})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
