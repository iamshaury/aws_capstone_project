from flask import Blueprint, jsonify, session
from ..services.portfolio_service import get_portfolio, get_portfolio_value
from ..services.auth_service import get_user_by_username
from ..services.trade_service import get_all_trades

portfolio_bp = Blueprint('portfolio', __name__)

@portfolio_bp.route('/', methods=['GET'])
def my_portfolio():
    if 'user' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    port = get_portfolio(session['user'])
    return jsonify(port)

@portfolio_bp.route('/dashboard', methods=['GET'])
def dashboard():
    if 'user' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    username = session['user']
    user = get_user_by_username(username)
    portfolio = get_portfolio(username)
    total_val = get_portfolio_value(username)
    
    return jsonify({
        'balance': user['virtualBalance'],
        'portfolio': portfolio,
        'total_portfolio_value': total_val
    })

@portfolio_bp.route('/transactions', methods=['GET'])
def my_transactions():
    if 'user' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
        
    username = session['user']
    user = get_user_by_username(username)
    if not user:
        return jsonify([])
        
    trades = get_all_trades()
    # Filter for this user - handle ObjectId vs String comparison safely
    user_id_str = str(user['_id'])
    user_trades = [
        t for t in trades 
        if str(t.get('userId')) == user_id_str or t.get('user') == username
    ]
    
    serialized = []
    for t in user_trades:
        t_dict = t.copy()
        t_dict.pop('_id', None)
        if 'userId' in t_dict:
            t_dict['userId'] = str(t_dict['userId'])
        serialized.append(t_dict)
        
    # Sort by time desc
    serialized.sort(key=lambda x: x.get('time', ''), reverse=True)
        
    return jsonify(serialized)

@portfolio_bp.route('/admin/transactions', methods=['GET'])
def admin_transactions():
    if 'user' not in session or session.get('role') != 'ADMIN':
        return jsonify({'error': 'Unauthorized'}), 403
    
    trades = get_all_trades()
    serialized = []
    for t in trades:
        t_dict = t.copy()
        t_dict.pop('_id', None)
        serialized.append(t_dict)
        
    return jsonify({'transactions': serialized})
