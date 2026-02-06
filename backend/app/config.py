import os
from dotenv import load_dotenv
import urllib.parse

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    
    AWS_REGION = os.environ.get('AWS_REGION_NAME', 'us-east-1')
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
    DYNAMODB_ENDPOINT = os.environ.get('DYNAMODB_ENDPOINT') # Optional: for local dynamo

    ALPHA_VANTAGE_KEY = os.environ.get('ALPHA_VANTAGE_KEY') or 'RTSTRBKY4VDW8QLP'
    INITIAL_VIRTUAL_BALANCE = 100000.0
