# User Management API

A FastAPI application that connects to Supabase to manage user data.

## Features

- GET endpoint to retrieve user data from Supabase
- POST endpoint to create new users in Supabase
- Data validation using Pydantic models

## Setup

1. Clone this repository
2. Create a virtual environment:
   ```
   python -m venv venv
   ```
3. Activate the virtual environment:
   - Windows:
     ```
     .\venv\Scripts\Activate.ps1
     ```
   - Linux/Mac:
     ```
     source venv/bin/activate
     ```
4. Install the dependencies:
   ```
   pip install -r requirements.txt
   ```
5. Create a `.env` file in the root directory and add your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   SUPABASE_DB_URL=your_postgres_connection_string
   ```
   (You can copy and rename the `.env.example` file)

## Running the Application

Run the application with:

```
python run.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /users` - Get all users
- `GET /users/{user_id}` - Get a specific user by ID
- `POST /users` - Create a new user

## API Documentation

Once the application is running, you can access the interactive API documentation at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Dependencies

This project uses the following main libraries:
- FastAPI: Modern web framework for building APIs
- Uvicorn: ASGI server for running the application
- Pydantic: Data validation and settings management
- HTTPX: HTTP client for making API requests
- Python-dotenv: Environment variable management 
