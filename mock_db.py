import time

class MockTable:
    def __init__(self, name):
        self.name = name
        self.items = {} # Key -> Item
        self.key_schema = 'username' if name == 'Users' else ('userId' if name == 'Portfolio' else 'id')

    def get_item(self, Key):
        # Flatten key for lookup if simple, else composite string
        k = list(Key.values())[0] if len(Key) == 1 else f"{Key.get('userId')}_{Key.get('symbol')}"
        
        if self.name == 'Users':
            k = Key['username']
        elif self.name == 'Portfolio':
             k = f"{Key['userId']}_{Key['symbol']}"

        item = self.items.get(k)
        return {'Item': item} if item else {}

    def put_item(self, Item):
        if self.name == 'Users':
            k = Item['username']
        elif self.name == 'Portfolio':
            k = f"{Item['userId']}_{Item['symbol']}"
        else:
            k = str(len(self.items)) # Auto-incish for others
            
        self.items[k] = Item
        return {'ResponseMetadata': {'HTTPStatusCode': 200}}

    def update_item(self, Key, UpdateExpression, ExpressionAttributeValues):
        # naive implementation for specific known patterns in this app
        # Users: set virtualBalance
        # Portfolio: set quantity, avgBuyPrice
        
        k = None
        if self.name == 'Users':
            k = Key['username']
        elif self.name == 'Portfolio':
             k = f"{Key['userId']}_{Key['symbol']}"
             
        if k not in self.items: return # Should not happen based on app logic calling get first
        
        item = self.items[k]
        
        # Parse UpdateExpression - VERY simplified for this specific app's needs
        # "set virtualBalance = :b"
        if "virtualBalance" in UpdateExpression:
            val = ExpressionAttributeValues[':b']
            item['virtualBalance'] = val
            
        # "set quantity = :q, avgBuyPrice = :p"
        if "quantity" in UpdateExpression:
            item['quantity'] = ExpressionAttributeValues[':q']
        if "avgBuyPrice" in UpdateExpression:
            item['avgBuyPrice'] = ExpressionAttributeValues[':p']
            
        self.items[k] = item
        return {'Attributes': item}

    def delete_item(self, Key):
        k = f"{Key['userId']}_{Key['symbol']}"
        if k in self.items:
            del self.items[k]
        return {'ResponseMetadata': {'HTTPStatusCode': 200}}

    def query(self, KeyConditionExpression):
        # Naive scan for portfolio "userId = :uid"
        # KeyConditionExpression=Key('userId').eq(username)
        return {'Items': []} 

class MockSNS:
    def publish(self, TopicArn, Subject, Message):
        print(f"[MockSNS] Subject: {Subject} | Message: {Message}")
        return {'MessageId': 'mock-id'}
