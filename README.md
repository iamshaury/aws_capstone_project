# Stocker - Local Trading Platform

Stocker is a simulation of a stock trading application built with Flask. It is designed as a "Phase 1" local development version, structured to be easily migrated to AWS services (DynamoDB, Cognito, Lambda) in the future in "Phase 2".

## Features

### 1. User Authentication
*   **Sign Up & Login**: Users can create accounts and log in.
*   **Session Management**: Secure session handling with automatic logout on invalid states (e.g., server restart).

### 2. Trading Dashboard
*   **Buy Stock**: Users can buy stocks given a ticker symbol and quantity. Prices are simulated.
*   **Sell Stock**: Users can sell stocks they currently own.
*   **Portfolio Tracking**: Real-time view of holdings, average cost, current market value, and unrealized gain/loss.
*   **Premium Style**: A modern, responsive UI built with a custom CSS design system.

### 3. Admin Dashboard
*   **Global Transaction Log**: Admins can view a history of all trades (Buy/Sell) across the platform.
*   **Access**: Login as `admin` (password: `admin123`).

### 4. Premium Services
*   Mocked premium service pages (Market Analytics, Tax Reporting, etc.) demonstrating application scaling.

## Project Structure

*   **`app.py`**: The core application logic.
    *   **`DataStore` Class**: An in-memory mock database that mimics the behavior of a real database. This isolation allows for easy swapping with AWS DynamoDB later without changing the route logic.
    *   **Routes**: Handles `/login`, `/buy`, `/sell`, `/admin`, etc.
*   **`templates/`**: HTML files for the frontend.
    *   `dashboard_trader.html`: The main user interface.
    *   `dashboard_admin.html`: The admin view.
    *   `buy_stock.html` / `sell_stock.html`: Transaction forms.
*   **`static/`**: Static assets.
    *   `css/style.css`: The global premium design system.

## Setup & Running

1.  **Install Dependencies**:
    ```bash
    pip install flask
    ```

2.  **Run the Application**:
    ```bash
    python app.py
    ```

3.  **Access**:
    Open your browser to `http://127.0.0.1:5000`.

## Future AWS Migration (Phase 2)
The code is written with migration in mind:
*   The `DataStore` class in `app.py` can be replaced with `boto3` calls to DynamoDB.
*   `get_stock_price` function can be replaced with an AWS Lambda invocation.
*   Authentication can be offloaded to AWS Cognito.
