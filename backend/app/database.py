import boto3
from .config import Config

# Initialize DynamoDB Resource
dynamodb = boto3.resource(
    'dynamodb',
    region_name=Config.AWS_REGION,
    aws_access_key_id=Config.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=Config.AWS_SECRET_ACCESS_KEY,
    endpoint_url=Config.DYNAMODB_ENDPOINT
)

# Define Table Objects
try:
    users_table = dynamodb.Table('Users')
    stocks_table = dynamodb.Table('Stocks')
    portfolio_table = dynamodb.Table('Portfolio')
    trades_table = dynamodb.Table('Trades')
    print(f"✅ DynamoDB Resource Initialized (Region: {Config.AWS_REGION})")
except Exception as e:
    print(f"❌ Failed to initialize DynamoDB resources: {e}")
    users_table = None
    stocks_table = None
    portfolio_table = None
    trades_table = None
