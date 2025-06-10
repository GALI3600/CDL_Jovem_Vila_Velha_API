from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from typing import List
from uuid import UUID
import pandas as pd
import io
import httpx
from pydantic import BaseModel

from app.models import UserCreate, UserResponse
from app.database import get_all_users, create_user

# Evolution API Configuration
EVOLUTION_URL = "https://evolution-victor.namastex.ai"
EVOLUTION_INSTANCE_NAME = "CDLVilaVelha"
EVOLUTION_API_KEY = "97D331C8C57A-45C9-9AA1-AF9FCAB5783E"

# Pydantic models for messaging
class SendTextMessageRequest(BaseModel):
    number: str
    text: str

class SendBulkTextMessageRequest(BaseModel):
    numbers: List[str]
    text: str

# Create FastAPI app
app = FastAPI(
    title="CDL Jovem Vila Velha API",
    description="API for CDL Jovem Vila Velha WhatsApp Campaign System",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation error",
            "errors": exc.errors(),
            "body": exc.body
        }
    )

@app.get("/")
async def health_check():
    """Check if API is running"""
    return {
        "status": "online",
        "service": "CDL Jovem Vila Velha API",
        "version": "2.0.0"
    }

@app.get("/users", response_model=List[UserResponse])
async def get_users():
    """Get all users from database"""
    users = await get_all_users()
    return users

@app.post("/users/upload-csv", status_code=201)
async def upload_users_csv(file: UploadFile = File(...)):
    """Upload CSV file with users data and save to database"""
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        content = await file.read()
        csv_string = content.decode('utf-8')
        df = pd.read_csv(io.StringIO(csv_string))
        
        # Validate required columns
        required_columns = ['first_name', 'phone']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required columns: {missing_columns}"
            )
        
        # Optional columns
        optional_columns = ['last_name', 'age', 'email', 'street_address', 'city', 'state', 'postal_code', 'country']
        
        users_data = []
        errors = []
        
        for index, row in df.iterrows():
            try:
                user_data = {
                    'first_name': str(row['first_name']).strip(),
                    'phone': str(row['phone']).strip()
                }
                
                if not user_data['first_name'] or not user_data['phone']:
                    errors.append(f"Row {index + 1}: first_name and phone cannot be empty")
                    continue
                
                # Add optional fields
                for col in optional_columns:
                    if col in df.columns and pd.notna(row[col]) and str(row[col]).strip():
                        if col == 'age':
                            try:
                                age_value = int(row[col])
                                if age_value <= 0:
                                    errors.append(f"Row {index + 1}: Age must be greater than 0")
                                    continue
                                user_data[col] = age_value
                            except ValueError:
                                errors.append(f"Row {index + 1}: Age must be a valid number")
                                continue
                        elif col == 'email':
                            email_value = str(row[col]).strip()
                            if '@' not in email_value:
                                errors.append(f"Row {index + 1}: Invalid email format")
                                continue
                            user_data[col] = email_value
                        else:
                            user_data[col] = str(row[col]).strip()
                    
                users_data.append(user_data)
                
            except Exception as e:
                errors.append(f"Row {index + 1}: Error processing data - {str(e)}")
        
        if errors:
            raise HTTPException(
                status_code=400, 
                detail={
                    "message": "Validation errors found",
                    "errors": errors,
                    "valid_rows": len(users_data),
                    "total_rows": len(df)
                }
            )
        
        if users_data:
            created_users = []
            failed_users = []
            
            for i, user_data in enumerate(users_data):
                try:
                    created_user = await create_user(user_data)
                    if created_user:
                        created_users.extend(created_user)
                except Exception as e:
                    error_message = str(e)
                    if "já existe" in error_message:
                        failed_users.append(f"Line {i + 1}: {error_message}")
                    else:
                        failed_users.append(f"Line {i + 1}: Error creating user - {error_message}")
            
            result = {
                "message": f"Import completed: {len(created_users)} contacts added",
                "imported_count": len(created_users),
                "total_rows": len(df)
            }
            
            if failed_users:
                result["warnings"] = failed_users
                result["failed_count"] = len(failed_users)
            
            return result
        else:
            raise HTTPException(status_code=400, detail="No valid users found in CSV")
            
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="CSV file is empty")
    except pd.errors.ParserError as e:
        raise HTTPException(status_code=400, detail=f"CSV parsing error: {str(e)}")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File encoding error. Please ensure CSV is UTF-8 encoded")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/messages/send", status_code=200)
async def send_message(message_request: SendTextMessageRequest):
    """Send WhatsApp text message to a single number"""
    
    try:
        url = f"{EVOLUTION_URL}/message/sendText/{EVOLUTION_INSTANCE_NAME}"
        
        headers = {
            "apikey": EVOLUTION_API_KEY,
            "Content-Type": "application/json"
        }
        
        payload = {
            "number": message_request.number,
            "text": message_request.text
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload)
            
            if response.status_code in [200, 201]:
                response_data = response.json()
                return {
                    "success": True,
                    "message": "Message sent successfully",
                    "data": {
                        "message_id": response_data.get("key", {}).get("id"),
                        "status": response_data.get("status"),
                        "timestamp": response_data.get("messageTimestamp")
                    }
                }
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Evolution API error: {response.text}"
                )
                
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Network error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending message: {str(e)}")

def normalize_phone_number(number: str) -> str:
    """
    Normalize phone number to include country code.
    Rules:
    - Remove any non-digit characters
    - If number starts with 55, keep as is
    - If number starts with 27 (ES DDD), add 55
    - If number doesn't start with 55 or 27, add 55
    """
    # Remove non-digit characters
    number = ''.join(filter(str.isdigit, number))
    
    if number.startswith('55'):
        return number
    elif number.startswith('27'):
        return f'55{number}'
    else:
        return f'55{number}'

@app.post("/messages/send-bulk", status_code=200)
async def send_bulk_messages(bulk_request: SendBulkTextMessageRequest):
    try:
        # Normalize all phone numbers
        normalized_numbers = [normalize_phone_number(num) for num in bulk_request.numbers]
        
        url = f"{EVOLUTION_URL}/message/sendText/{EVOLUTION_INSTANCE_NAME}"
        headers = {
            "Content-Type": "application/json",
            "apikey": EVOLUTION_API_KEY
        }
        
        successful = []
        failed = []
        
        async with httpx.AsyncClient() as client:
            for number in normalized_numbers:
                try:
                    payload = {
                        "number": number,
                        "text": bulk_request.text
                    }
                    
                    response = await client.post(url, json=payload, headers=headers)
                    response.raise_for_status()
                    
                    successful.append({
                        "number": number,
                        "status": "sent"
                    })
                except Exception as e:
                    failed.append({
                        "number": number,
                        "error": f"API Error: {str(e)}"
                    })
        
        return {
            "success": True,
            "message": "Bulk message operation completed",
            "summary": {
                "total_numbers": len(bulk_request.numbers),
                "successful_sends": len(successful),
                "failed_sends": len(failed)
            },
            "results": {
                "successful": successful,
                "failed": failed
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending message: {str(e)}") 