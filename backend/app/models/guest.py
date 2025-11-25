"""
Guest Model - für Gäste-Verwaltung
"""
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Guest(Base):
    """
    Guest Model - Gäste mit offenen Tabs
    """
    __tablename__ = "guests"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    closed_at = Column(DateTime, nullable=True)
    total_amount = Column(Float, default=0.0, nullable=False)
    
    # Relationships
    tab_items = relationship("GuestTab", back_populates="guest", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="guest")
    
    @property
    def is_active(self) -> bool:
        """Gast ist aktiv wenn closed_at NULL ist"""
        return self.closed_at is None
    
    def __repr__(self):
        status = "aktiv" if self.is_active else "geschlossen"
        return f"<Guest {self.name} ({status})>"
