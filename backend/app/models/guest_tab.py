"""
Guest Tab Model - Tab-Positionen für Gäste
"""
from sqlalchemy import Column, Integer, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class GuestTab(Base):
    """
    GuestTab Model - Einzelne Positionen auf einem Gast-Tab
    """
    __tablename__ = "guest_tabs"
    
    id = Column(Integer, primary_key=True, index=True)
    guest_id = Column(Integer, ForeignKey("guests.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    price_per_item = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    paid = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    guest = relationship("Guest", back_populates="tab_items")
    product = relationship("Product")
    
    def __repr__(self):
        return f"<GuestTab {self.quantity}x {self.product.name} = {self.total_amount}€>"
