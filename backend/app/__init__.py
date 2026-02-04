from flask import Flask
from flask_cors import CORS
from .config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS for frontend
    # Enable CORS for frontend - Allow common Vite ports
    CORS(app, supports_credentials=True, origins=[
        "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", 
        "http://localhost:5176", "http://localhost:5177", "http://localhost:3000"
    ])

    # Register Blueprints
    from .routes.auth_routes import auth_bp
    from .routes.stock_routes import stock_bp
    from .routes.trade_routes import trade_bp
    from .routes.portfolio_routes import portfolio_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(stock_bp, url_prefix='/api/stock') # Note singular 'stock' to match old API if needed, or plural
    app.register_blueprint(trade_bp, url_prefix='/api') # /api/buy, /api/sell to match old API structure or new
    # Wait, let's normalize. 
    # Old API: /api/buy, /api/sell
    # New Plan: /api/trade/buy, /api/trade/sell
    # To avoid breaking frontend immediately, let's keep old structure or update frontend.
    # Plan said: "Update Frontend API Clients". So we will clean up structure.
    # Let's map clean routes:
    
    # Correction: The plan in `task.md` says "Update Frontend API Clients". 
    # The blueprint `trade_bp` has `/buy` and `/sell`.
    # Any prefix we put here gets prepended.
    # If we want `/api/buy`, we register with `/api`.
    # If we want `/api/trade/buy`, we register with `/api/trade`.
    # Let's go with Professional: `/api/trade`
    
    app.register_blueprint(portfolio_bp, url_prefix='/api') # /api/dashboard, /api/admin/transactions
    
    return app
