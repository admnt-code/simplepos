"""
Guest Tab Schemas
"""
from pydantic import BaseModel, Field
from datetime import datetime


class GuestTabCreate(BaseModel):
    guest_id: int
    product_id: int
    quantity: int = Field(..., gt=0)


class GuestTabResponse(BaseModel):
    id: int
    guest_id: int
    product_id: int
    quantity: int
    price_per_item: float
    total_amount: float
    created_at: datetime
    paid: bool
    
    class Config:
        from_attributes = True
