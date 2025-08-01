import os
import httpx
import json
from dotenv import load_dotenv
from uuid import UUID
from typing import List, Optional, Dict, Any

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


# ========================
# FORMS OPERATIONS
# ========================

async def get_all_forms():
    """Get all forms from the database using Supabase REST API"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/forms",
                headers=headers
            )
            
            print(f"GET forms - Status: {response.status_code}")
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Error response: {response.text}")
                return []
        except Exception as e:
            print(f"Error in get_all_forms: {e}")
            return []


async def get_form_by_id(form_id: UUID):
    """Get a form by its ID using Supabase REST API"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/forms",
                headers=headers,
                params={"id": f"eq.{form_id}"}
            )
            
            print(f"GET form by ID - Status: {response.status_code}")
            
            if response.status_code == 200 and response.json():
                return response.json()[0]
            else:
                print(f"Error response: {response.text}")
                return None
        except Exception as e:
            print(f"Error in get_form_by_id: {e}")
            return None


async def create_form(form_data: dict):
    """Create a new form in the database using Supabase REST API"""
    async with httpx.AsyncClient() as client:
        try:
            print(f"Creating form with data: {form_data}")
            
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/forms",
                headers=headers,
                json=form_data
            )
            
            print(f"POST form - Status: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code in (201, 200):
                return response.json()
            elif response.status_code == 409:
                # Handle duplicate key constraint
                try:
                    error_data = response.json()
                    if "duplicate key value violates unique constraint" in error_data.get("message", ""):
                        if "forms_title_key" in error_data.get("message", ""):
                            raise Exception(f"Formulário com título '{form_data.get('title')}' já existe")
                        else:
                            raise Exception("Formulário já existe no banco de dados")
                    else:
                        raise Exception(f"Conflict error: {error_data.get('message', 'Unknown conflict')}")
                except (json.JSONDecodeError, KeyError):
                    raise Exception("Formulário já existe no banco de dados")
            else:
                print(f"Error creating form: {response.text}")
                try:
                    error_data = response.json()
                    error_message = error_data.get("message", f"HTTP {response.status_code}")
                    raise Exception(f"Erro ao criar formulário: {error_message}")
                except (json.JSONDecodeError, KeyError):
                    raise Exception(f"Erro ao criar formulário: HTTP {response.status_code}")
        except Exception as e:
            print(f"Error in create_form: {e}")
            # Re-raise the exception to be handled by the calling function
            raise e


# ========================
# LEADS OPERATIONS  
# ========================

async def get_all_leads():
    """Get all leads from the database using Supabase REST API"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/leads",
                headers=headers
            )
            
            print(f"GET leads - Status: {response.status_code}")
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Error response: {response.text}")
                return []
        except Exception as e:
            print(f"Error in get_all_leads: {e}")
            return []


async def get_leads_by_form_id(form_id: UUID):
    """Get all leads for a specific form using Supabase REST API"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/leads",
                headers=headers,
                params={"form_id": f"eq.{form_id}"}
            )
            
            print(f"GET leads by form ID - Status: {response.status_code}")
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Error response: {response.text}")
                return []
        except Exception as e:
            print(f"Error in get_leads_by_form_id: {e}")
            return []


async def get_leads_by_ids(lead_ids: List[UUID]):
    """Get specific leads by their IDs using Supabase REST API"""
    async with httpx.AsyncClient() as client:
        try:
            # Convert UUIDs to strings for the query
            id_strings = [str(lead_id) for lead_id in lead_ids]
            id_filter = f"in.({','.join(id_strings)})"
            
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/leads",
                headers=headers,
                params={"id": id_filter}
            )
            
            print(f"GET leads by IDs - Status: {response.status_code}")
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Error response: {response.text}")
                return []
        except Exception as e:
            print(f"Error in get_leads_by_ids: {e}")
            return []


async def create_lead(lead_data: dict):
    """Create a new lead in the database using Supabase REST API"""
    async with httpx.AsyncClient() as client:
        try:
            print(f"Creating lead with data: {lead_data}")
            
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/leads",
                headers=headers,
                json=lead_data
            )
            
            print(f"POST lead - Status: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code in (201, 200):
                return response.json()
            elif response.status_code == 409:
                # Handle duplicate key constraint
                try:
                    error_data = response.json()
                    if "duplicate key value violates unique constraint" in error_data.get("message", ""):
                        if "leads_phone_key" in error_data.get("message", ""):
                            raise Exception(f"Lead com telefone {lead_data.get('phone')} já existe")
                        else:
                            raise Exception("Lead já existe no banco de dados")
                    else:
                        raise Exception(f"Conflict error: {error_data.get('message', 'Unknown conflict')}")
                except (json.JSONDecodeError, KeyError):
                    raise Exception("Lead já existe no banco de dados")
            else:
                print(f"Error creating lead: {response.text}")
                try:
                    error_data = response.json()
                    error_message = error_data.get("message", f"HTTP {response.status_code}")
                    raise Exception(f"Erro ao criar lead: {error_message}")
                except (json.JSONDecodeError, KeyError):
                    raise Exception(f"Erro ao criar lead: HTTP {response.status_code}")
        except Exception as e:
            print(f"Error in create_lead: {e}")
            # Re-raise the exception to be handled by the calling function
            raise e


async def create_leads_batch(leads_data: List[dict]):
    """Create multiple leads in the database using Supabase REST API"""
    async with httpx.AsyncClient() as client:
        try:
            print(f"Creating {len(leads_data)} leads in batch")
            print(f"Sample lead data: {leads_data[0] if leads_data else 'No data'}")
            
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/leads",
                headers=headers,
                json=leads_data,
                timeout=30.0  # Add timeout
            )
            
            print(f"POST batch leads - Status: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code in (201, 200):
                result = response.json()
                print(f"Successfully created {len(result)} leads")
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
            print(f"Error in create_leads_batch: {e}")
            raise Exception(f"Database error: {str(e)}") 