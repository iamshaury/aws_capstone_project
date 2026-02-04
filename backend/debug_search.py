import sys
import os

# Add the project root to the python path
sys.path.append(os.path.abspath('/home/shaury/aws_capstone_project/backend'))

from app.services.alpha_vantage_service import search_stocks, fetch_alpha_vantage

print("Testing Alpha Vantage Search...")
# Try raw fetch first to see full response
raw_data = fetch_alpha_vantage('SYMBOL_SEARCH', keywords='AAPL')
print(f"Raw Response: {raw_data}")

# Try specific function
results = search_stocks('AAPL')
print(f"Parsed Results: {results}")
