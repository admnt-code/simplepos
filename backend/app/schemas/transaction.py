"""
Schemas für Transactions
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.transaction import TransactionType, TransactionStatus, PaymentMethod


class TransactionCreate(BaseModel):
    amount: float = Field(..., gt=0)
    transaction_type: str  # String statt ENUM
    payment_method: str = Field(default="balance")  # String statt ENUM
    description: Optional[str] = None
    transfer_to_user_id: Optional[int] = None

class TransactionResponse(BaseModel):
    id: int
    transaction_reference: str
    user_id: Optional[int]
    transaction_type: TransactionType
    status: TransactionStatus
    amount: float
    balance_before: Optional[float]
    balance_after: Optional[float]
    payment_method: Optional[PaymentMethod]
    description: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class PurchaseCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class PurchaseResponse(BaseModel):
    id: int
    purchase_reference: str
    product_id: int
    quantity: int
    unit_price: float
    total_price: float
    tax_amount: float
    balance_before: Optional[float]
    balance_after: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


class TopUpRequest(BaseModel):
    """Schema for top-up requests"""
    amount: float = Field(..., gt=0, description="Amount to top up")
    payment_method: str = Field(default="cloud_api")  # String statt ENUM
