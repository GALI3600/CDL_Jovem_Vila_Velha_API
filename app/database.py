import os
import httpx
import json
from dotenv import load_dotenv
from uuid import UUID
from typing import List

# Load environment variables
load_dotenv()

# Get Supabase credentials from environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print(f"Supabase URL: {SUPABASE_URL}")
print(f"Supabase Key: {SUPABASE_KEY[:20]}..." if SUPABASE_KEY else "No key found")

# Set up the headers for Supabase REST API
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}


async def get_all_users():
    """Get all users from the database using Supabase REST API"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/users",
                headers=headers
            )
            
            print(f"GET users - Status: {response.status_code}")
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Error response: {response.text}")
                return []
        except Exception as e:
            print(f"Error in get_all_users: {e}")
            return []


async def get_user_by_id(user_id):
    """Get a user by their ID using Supabase REST API"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/users",
                headers=headers,
                params={"id": f"eq.{user_id}"}
            )
            
            print(f"GET user by ID - Status: {response.status_code}")
            
            if response.status_code == 200 and response.json():
                return response.json()[0]
            else:
                print(f"Error response: {response.text}")
                return None
        except Exception as e:
            print(f"Error in get_user_by_id: {e}")
            return None


async def create_user(user_data):
    """Create a new user in the database using Supabase REST API"""
    async with httpx.AsyncClient() as client:
        try:
            print(f"Creating user with data: {user_data}")
            
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/users",
                headers=headers,
                json=user_data
            )
            
            print(f"POST user - Status: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code in (201, 200):
                return response.json()
            elif response.status_code == 409:
                # Handle duplicate key constraint
                try:
                    error_data = response.json()
                    if "duplicate key value violates unique constraint" in error_data.get("message", ""):
                        if "users_phone_key" in error_data.get("message", ""):
                            raise Exception(f"Usuário com telefone {user_data.get('phone')} já existe")
                        else:
                            raise Exception("Usuário já existe no banco de dados")
                    else:
                        raise Exception(f"Conflict error: {error_data.get('message', 'Unknown conflict')}")
                except (json.JSONDecodeError, KeyError):
                    raise Exception("Usuário já existe no banco de dados")
            else:
                print(f"Error creating user: {response.text}")
                try:
                    error_data = response.json()
                    error_message = error_data.get("message", f"HTTP {response.status_code}")
                    raise Exception(f"Erro ao criar usuário: {error_message}")
                except (json.JSONDecodeError, KeyError):
                    raise Exception(f"Erro ao criar usuário: HTTP {response.status_code}")
        except Exception as e:
            print(f"Error in create_user: {e}")
            # Re-raise the exception to be handled by the calling function
            raise e


async def create_users_batch(users_data: List[dict]):
    """Create multiple users in the database using Supabase REST API"""
    async with httpx.AsyncClient() as client:
        try:
            print(f"Creating {len(users_data)} users in batch")
            print(f"Sample user data: {users_data[0] if users_data else 'No data'}")
            
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/users",
                headers=headers,
                json=users_data,
                timeout=30.0  # Add timeout
            )
            
            print(f"POST batch users - Status: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code in (201, 200):
                result = response.json()
                print(f"Successfully created {len(result)} users")
                return result
            else:
                error_msg = f"Supabase API error - Status: {response.status_code}, Response: {response.text}"
                print(error_msg)
                raise Exception(error_msg)
        except httpx.TimeoutException:
            error_msg = "Request timeout - Supabase took too long to respond"
            print(error_msg)
            raise Exception(error_msg)
        except httpx.RequestError as e:
            error_msg = f"Network error connecting to Supabase: {str(e)}"
            print(error_msg)
            raise Exception(error_msg)
        except Exception as e:
            print(f"Error in create_users_batch: {e}")
            raise Exception(f"Database error: {str(e)}") 