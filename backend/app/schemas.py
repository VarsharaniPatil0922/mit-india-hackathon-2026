from pydantic import BaseModel
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
    role_name: str
    quantity_needed: int

class EventCreate(BaseModel):
    event_type: str
    date: str
    time: str
    location: str
    latitude: float
    longitude: float
    proximity_radius: float
    budget: int
    roles: List[EventRoleCreate]

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
