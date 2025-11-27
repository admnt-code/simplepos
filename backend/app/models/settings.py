"""
Vereinskasse - System Settings Model
Datei: backend/app/models/settings.py
System-Einstellungen (SumUp Mode, etc.)
"""
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from app.db.session import Base


class SystemSettings(Base):
    """
    System Settings Model
    """
    __tablename__ = "system_settings"
    
    # Primary Key
    id = Column(Integer, primary_key=True)
    
    # SumUp Settings
    sumup_mode = Column(String(20), default="cloud_api", nullable=False)
    sumup_reader_id = Column(String(100), nullable=True)
    sumup_reader_name = Column(String(100), nullable=True)
    
    # Feature Flags
    guest_sumup_enabled = Column(Boolean, default=True)
    # member_transfer_enabled = Column(Boolean, default=True)  # ENTFERNT - Feature nicht verwendet
    
    # Locale
    default_language = Column(String(5), default="de")
    
    # Maintenance
    maintenance_mode = Column(Boolean, default=False)
    maintenance_message = Column(Text, nullable=True)
    
    # Timestamps
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<SystemSettings ID-{self.id}>"
