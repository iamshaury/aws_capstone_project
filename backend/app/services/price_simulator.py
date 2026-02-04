import random

def simulate_price(price):
    change = random.uniform(-0.02, 0.02)
    return round(price * (1 + change), 2)
