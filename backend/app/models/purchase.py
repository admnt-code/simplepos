"""
Purchase Model - NUR für Mitglieder (Guest temporär deaktiviert)
"""
from datetime import datetime
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.db.session import Base


class Purchase(Base):
    """Purchase Model - NUR User, kein Guest"""
    __tablename__ = "purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    purchase_reference = Column(String(100), unique=True, nullable=False, index=True)
    
    # NUR User
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Product
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    
    # Details
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    tax_rate = Column(Float, nullable=False)
    tax_amount = Column(Float, nullable=False)
    
    # Balance
    balance_before = Column(Float, nullable=True)
    balance_after = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationships - SIMPLE
    user = relationship("User", back_populates="purchases")
    product = relationship("Product", back_populates="purchases")
    
    def __repr__(self):
        return f"<Purchase {self.purchase_reference} - User-{self.user_id}>"
    
    @classmethod
    def generate_reference(cls) -> str:
        import secrets
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        random_part = secrets.token_hex(4).upper()
        return f"PUR-{timestamp}-{random_part}"
