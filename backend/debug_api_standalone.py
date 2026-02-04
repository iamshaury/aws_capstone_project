import urllib.request
import json

API_KEY = "RTSTRBKY4VDW8QLP"
BASE_URL = "https://www.alphavantage.co/query"

def test_search():
    url = f"{BASE_URL}?function=SYMBOL_SEARCH&keywords=AAPL&apikey={API_KEY}"
    print(f"Fetching: {url}")
    try:
        with urllib.request.urlopen(url) as response:
            data = response.read()
            json_data = json.loads(data)
            print("Response:")
            print(json.dumps(json_data, indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_search()
