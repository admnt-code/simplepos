"""
Schemas für Products
"""
from typing import Optional
from pydantic import BaseModel, Field
from app.models.products import ProductCategory


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    category: ProductCategory
    variant: Optional[str] = Field(None, max_length=50)
    member_price: float = Field(..., gt=0)
    guest_price: float = Field(..., gt=0)
    tax_rate: float = Field(..., ge=0, le=1)
    is_available: bool = True
    sort_order: int = 0


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    category: Optional[ProductCategory] = None
    variant: Optional[str] = None
    member_price: Optional[float] = Field(None, gt=0)
    guest_price: Optional[float] = Field(None, gt=0)
    tax_rate: Optional[float] = Field(None, ge=0, le=1)
    is_available: Optional[bool] = None
    sort_order: Optional[int] = None


class ProductResponse(ProductBase):
    id: int
    
    class Config:
        from_attributes = True
