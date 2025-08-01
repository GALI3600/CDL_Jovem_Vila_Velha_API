from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID


class UserBase(BaseModel):
    first_name: str
    phone: str
    last_name: Optional[str] = None
    age: Optional[int] = Field(default=None, gt=0)
    email: Optional[str] = None
    street_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Forms Models
class FormBase(BaseModel):
    title: str
    description: Optional[str] = None


class FormCreate(FormBase):
    pass


class FormResponse(FormBase):
    id: UUID
    google_form_id: Optional[str] = None
    google_form_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Leads Models
class LeadBase(BaseModel):
    first_name: str
    phone: str
    last_name: Optional[str] = None
    email: Optional[str] = None


class LeadCreate(LeadBase):
    form_id: UUID
    responses: Optional[Dict[str, Any]] = {}


class LeadResponse(LeadBase):
    id: UUID
    form_id: UUID
    responses: Optional[Dict[str, Any]] = {}
    created_at: datetime

    class Config:
        from_attributes = True


# Messaging Models for Leads
class SendLeadMessagesRequest(BaseModel):
    lead_ids: list[UUID]
    text: str


class SendFormLeadMessagesRequest(BaseModel):
    form_id: UUID
    text: str 