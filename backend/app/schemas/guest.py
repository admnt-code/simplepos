"""
Guest Schemas
"""
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


class GuestBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class GuestCreate(GuestBase):
    pass


class GuestUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)


class GuestTabItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    price_per_item: float
    total_amount: float
    created_at: datetime
    paid: bool
    
    class Config:
        from_attributes = True


class GuestResponse(GuestBase):
    id: int
    created_at: datetime
    closed_at: Optional[datetime]
    total_amount: float
    is_active: bool
    tab_items: Optional[List[GuestTabItemResponse]] = []
    
    class Config:
        from_attributes = True


class GuestCloseTabRequest(BaseModel):
    payment_method: str = Field(..., pattern="^(cash|cloud_api)$")
