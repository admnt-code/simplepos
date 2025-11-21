"""
Guest Model - Einfache Version OHNE Relationships
"""
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Boolean
from app.db.session import Base


class Guest(Base):
    """Guest Model - Vereinfacht"""
    __tablename__ = "guests"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    guest_number = Column(String(20), unique=True, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_archived = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    archived_at = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<Guest {self.name} ({self.guest_number})>"
    
    @classmethod
    def generate_guest_number(cls) -> str:
        from datetime import datetime
        date_part = datetime.now().strftime("%Y%m%d")
        import random
        return f"G-{date_part}-{random.randint(100, 999)}"
