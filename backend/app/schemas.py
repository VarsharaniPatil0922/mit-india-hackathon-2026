from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    user_type: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_type: str

class WorkerProfileCreate(BaseModel):
    name: str
    skill_category: str
    price_min: int
    price_max: int
    location: str
    latitude: float
    longitude: float

class WorkerAvailabilityCreate(BaseModel):
    date: str
    start_time: str
    end_time: str

class EventRoleCreate(BaseModel):
    role_name: str = Field(..., min_length=1)
    quantity_needed: int = Field(..., ge=1, le=50)

    @validator('role_name')
    def validate_role_name(cls, v):
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Role name cannot be empty")
        return trimmed

class EventCreate(BaseModel):
    event_type: str = Field(..., min_length=1)
    event_date: str = Field(..., min_length=1)
    start_time: str = Field(..., min_length=1)
    end_time: str = Field(..., min_length=1)
    location: str = Field(..., min_length=1)
    latitude: float
    longitude: float
    proximity_radius: float = Field(..., gt=0)
    budget: int = Field(..., gt=0)
    roles: List[EventRoleCreate] = Field(..., min_items=1)

    @validator('roles')
    def validate_roles(cls, v):
        if not v:
            raise ValueError("At least one role is required")
        seen = set()
        for role in v:
            name_lower = role.role_name.lower()
            if name_lower in seen:
                raise ValueError(f"Role '{role.role_name}' is already added. Increase its quantity instead.")
            seen.add(name_lower)
        return v

class CrewAssignmentCreate(BaseModel):
    event_id: int
    role_id: int
    worker_id: int
    price_agreed: int

class NotificationResponse(BaseModel):
    id: int
    message: str
    event_id: Optional[int]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
