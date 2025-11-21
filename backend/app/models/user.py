"""
User Model mit korrigierten Relationships
"""
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import relationship
from app.db.session import Base


class User(Base):
    """User Model für Mitglieder und Admins"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Auth
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # RFID
    rfid_token = Column(String(100), unique=True, nullable=True, index=True)
    
    # Profil
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    
    # Guthaben
    balance = Column(Float, default=0.0, nullable=False)
    
    # Permissions
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships - MIT foreign_keys!
    transactions = relationship(
        "Transaction",
        foreign_keys="[Transaction.user_id]",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    purchases = relationship(
        "Purchase",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        return f"<User {self.username}>"
    
    @property
    def full_name(self) -> str:
        """Vollständiger Name"""
        return f"{self.first_name} {self.last_name}"
    
    @property
    def can_purchase(self) -> bool:
        """Prüft ob User kaufen kann"""
        from app.core.config import settings
        return self.balance > settings.MEMBER_CREDIT_LIMIT
