from flask import Blueprint, jsonify, session, render_template, redirect, url_for
from ..services.portfolio_service import get_portfolio, get_portfolio_value
from ..services.auth_service import get_user_by_username
from ..services.trade_service import get_all_trades

portfolio_bp = Blueprint('portfolio', __name__)

@portfolio_bp.route('/', methods=['GET'])
def portfolio_view():
    if 'user' not in session:
        return redirect(url_for('auth.login'))
    
    username = session['user']
    portfolio = get_portfolio(username)
    total_value = get_portfolio_value(username)
    
    return render_template('portfolio.html', portfolio=portfolio, total_value=total_value)

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
    user_id_str = str(user['_id']) if '_id' in user else ''
    # Fallback if _id missing or using username as ID in DynamoDB
    
    user_trades = [
        t for t in trades 
        if (str(t.get('userId')) == user_id_str) or (t.get('user') == username)
    ]
    
    serialized = []
    for t in user_trades:
        t_dict = t.copy()
        # DynamoDB items don't strictly have _id like Mongo, but if they do:
        if '_id' in t_dict:
             t_dict.pop('_id', None)
        if 'userId' in t_dict:
            t_dict['userId'] = str(t_dict['userId'])
        serialized.append(t_dict)
        
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
        if '_id' in t_dict:
            t_dict.pop('_id', None)
        serialized.append(t_dict)
        
    return jsonify({'transactions': serialized})
