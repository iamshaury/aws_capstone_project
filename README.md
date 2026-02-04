# Stocker - Local Trading Platform

Stocker is a simulation of a stock trading application. It is designed as a "Phase 1" local development version, structured to be easily migrated to AWS services (DynamoDB, Cognito, Lambda) in the future in "Phase 2".

## Architecture
The application is split into two parts:
- **Backend**: Flask API with a Mock Database (in-memory) simulating MongoDB/DynamoDB.
- **Frontend**: React application built with Vite for the user interface.

## Project Structure

*   **`backend/`**: Python Flask API
    *   **`app/`**: Application logic (routes, services, models).
    *   **`run.py`**: Entry point.
    *   **`database.py`**: Mock database implementation (swappable with real MongoDB/DynamoDB).
*   **`frontend/`**: React + Vite Application
    *   **`src/`**: React components and logic.
    *   **`api/`**: API client configuration.

## Setup & Running

### 1. Prerequisites
- Python 3.8+
- Node.js & npm

### 2. Backend Setup
The backend runs on port `5000`.

1.  **Activate Virtual Environment**:
    ```bash
    # Linux/Mac
    source venv/bin/activate
    # Windows
    # venv\Scripts\activate
    ```
    *(If venv is missing: `python -m venv venv`)*

2.  **Install Dependencies**:
    ```bash
    cd backend
    pip install -r requirements.txt
    ```

3.  **Run the Backend**:
    ```bash
    python run.py
    ```

### 3. Frontend Setup
The frontend runs on port `5173` (default Vite port).

1.  **Install Dependencies**:
    Open a new terminal.
    ```bash
    cd frontend
    npm install
    ```

2.  **Run the Frontend**:
    ```bash
    npm run dev
    ```

### 4. Access
- **Application**: Open your browser to `http://localhost:5173`.
- **API**: The backend API is available at `http://127.0.0.1:5000`.

### 5. Login Credentials
- **Admin**:
    - Username: `admin`
    - Password: `admin123`
- **New User**: You can sign up with a new account from the login page.

## Future AWS Migration (Phase 2)
The code is written with migration in mind:
*   The `MockDB` class in `backend/app/database.py` allows identifying data access patterns.
*   Authentication endpoints in `backend/app/routes/auth_routes.py` are isolated.
*   External services like Alpha Vantage are wrapped in service classes.
