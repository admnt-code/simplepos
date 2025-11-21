"""
Schemas für User/Member
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, validator


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    is_admin: bool = False


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None


class UserChangePassword(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)


class UserRFIDLink(BaseModel):
    rfid_token: str = Field(..., min_length=8)


class UserResponse(UserBase):
    id: int
    balance: float
    is_active: bool
    is_admin: bool
    rfid_token: Optional[str]
    created_at: datetime
    last_login: Optional[datetime]
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int


class LoginRequest(BaseModel):
    username: str
    password: str


class RFIDLoginRequest(BaseModel):
    rfid_token: str
