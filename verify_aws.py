import sys
import os
import boto3
from botocore.exceptions import ClientError

# Add current directory to path to import app modules
sys.path.append(os.getcwd())

try:
    from app import Config, dynamodb, sns, users_table, stocks_table, portfolio_table, trades_table
except ImportError as e:
    print(f"Error importing app modules: {e}")
    sys.exit(1)

def check_dynamodb():
    print("\n--- Checking DynamoDB ---")
    try:
        # Check if tables exist by trying to load them
        tables = ['Users', 'Stocks', 'Portfolio', 'Trades']
        existing_tables = []
        
        # List tables (this verifies connection)
        print(f"Connecting to DynamoDB in region: {Config.AWS_REGION}...")
        
        # If running locally with minimal perms, list_tables might fail, 
        # but let's try to access the specific tables we defined.
        if dynamodb is None:
            print("⚠️ DynamoDB resource is None (Mock Mode active). Skipping table checks.")
            return False
        
        for name in tables:
            try:
                table = dynamodb.Table(name)
                # Accessing creation_date forces a call to AWS
                status = table.table_status
                print(f"✅ Table '{name}' exists. Status: {status}")
                existing_tables.append(name)
            except ClientError as e:
                if e.response['Error']['Code'] == 'ResourceNotFoundException':
                    print(f"❌ Table '{name}' does NOT exist.")
                else:
                    print(f"❌ Error checking table '{name}': {e}")
            except Exception as e:
                 print(f"❌ Unexpected error checking table '{name}': {e}")

        if len(existing_tables) == len(tables):
            print("✅ All required DynamoDB tables are accessible.")
            return True
        else:
            print("⚠️ Some tables are missing. The application handles this but they should ideally exist.")
            return False

    except Exception as e:
        print(f"❌ Failed to connect to DynamoDB: {e}")
        return False

def check_sns():
    print("\n--- Checking SNS ---")
    topic_arn = Config.AWS_SNS_TOPIC_ARN
    if not topic_arn:
        print("⚠️ AWS_SNS_TOPIC_ARN is not set in Config.")
        return False

    print(f"Checking SNS Topic: {topic_arn}")
    try:
        # Get topic attributes to verify existence
        if not hasattr(sns, 'get_topic_attributes'):
             print(f"⚠️  Using MOCK SNS (In-Memory). Topic ARN configured: {topic_arn}")
             return True
        response = sns.get_topic_attributes(TopicArn=topic_arn)
        print("✅ SNS Topic exists and is accessible.")
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == 'NotFound':
            print("❌ SNS Topic does NOT exist.")
        elif e.response['Error']['Code'] == 'AuthorizationError':
             print("❌ Permission denied accessing SNS Topic. Check IAM Role/Credentials.")
        else:
            print(f"❌ Error accessing SNS: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error accessing SNS: {e}")
        return False

if __name__ == "__main__":
    print("Starting AWS Resource Verification...")
    db_ok = check_dynamodb()
    sns_ok = check_sns()
    
    if db_ok and sns_ok:
        print("\n✅ Verification PASSED: Project is ready for AWS.")
    else:
        print("\n⚠️ Verification COMPLETED with ISSUES. See above.")
