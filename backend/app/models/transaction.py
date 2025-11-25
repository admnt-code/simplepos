"""
Transaction Models
"""
import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base


class TransactionType(str, enum.Enum):
    """Transaction Types"""
    top_up = "top_up"
    transfer = "transfer"
    purchase = "purchase"
    admin_adjustment = "admin_adjustment"


class TransactionStatus(str, enum.Enum):
    """Transaction Status"""
    pending = "pending"
    successful = "successful"
    failed = "failed"
    cancelled = "cancelled"



class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    SUMUP_CLOUD_API = "cloud_api"  # Changed from 'sumup_cloud_api'
    SUMUP_PAYMENT_LINK = "payment_link"
    BALANCE = "balance"
    TRANSFER = "transfer"

class Transaction(Base):
    """Transaction Model"""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_reference = Column(String(50), unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    transaction_type = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default="pending")
    amount = Column(Float, nullable=False)
    balance_before = Column(Float, nullable=True)
    balance_after = Column(Float, nullable=True)
    payment_method = Column(String(50), nullable=True)
    sumup_checkout_id = Column(String(100), nullable=True)
    sumup_transaction_code = Column(String(100), nullable=True)
    transfer_to_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    description = Column(String, nullable=True)
    created_by_admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    guest_id = Column(Integer, ForeignKey("guests.id"), nullable=True)  # NEU
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="transactions")
    transfer_to_user = relationship("User", foreign_keys=[transfer_to_user_id])
    created_by_admin = relationship("User", foreign_keys=[created_by_admin_id])
    guest = relationship("Guest", back_populates="transactions")  # NEU
