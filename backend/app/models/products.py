"""
Vereinskasse - Product Model
Datei: backend/app/models/product.py

Produkte mit Kategorien und dualen Preislisten
"""

from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Enum, Float, Integer, String, Text
from sqlalchemy.orm import relationship
import enum
from app.db.session import Base


class ProductCategory(str, enum.Enum):
    """Produkt-Kategorien"""
    DRINKS = "drinks"
    SNACKS = "snacks"
    FOOD = "food"


class Product(Base):
    """
    Product Model mit Mitglieder- und Gästepreisen
    """
    __tablename__ = "products"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Basis-Info
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(Enum(ProductCategory), nullable=False, index=True)
    
    # Variante (z.B. "0.5L", "klein", "groß")
    variant = Column(String(50), nullable=True)
    
    # Preise
    member_price = Column(Float, nullable=False)
    guest_price = Column(Float, nullable=False)
    
    # MwSt
    tax_rate = Column(Float, nullable=False, default=0.19)  # 19% Standard
    
    # Bestand (optional für spätere Erweiterung)
    stock_quantity = Column(Integer, nullable=True)
    track_stock = Column(Boolean, default=False)
    
    # Status
    is_available = Column(Boolean, default=True, nullable=False)
    
    # Sortierung
    sort_order = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    purchases = relationship("Purchase", back_populates="product")
    
    def __repr__(self):
        return f"<Product {self.name} ({self.variant or 'Standard'})>"
    
    @property
    def full_name(self) -> str:
        """Vollständiger Name mit Variante"""
        if self.variant:
            return f"{self.name} ({self.variant})"
        return self.name
    
    def get_price(self, is_member: bool = True) -> float:
        """
        Gibt Preis basierend auf Mitgliedschaft zurück
        
        Args:
            is_member: True für Mitgliederpreis, False für Gästepreis
            
        Returns:
            float: Preis
        """
        return self.member_price if is_member else self.guest_price
    
    def calculate_tax(self, price: float) -> float:
        """
        Berechnet MwSt.-Betrag
        
        Args:
            price: Bruttopreis
            
        Returns:
            float: MwSt.-Betrag
        """
        # Berechnung: Brutto / (1 + Steuersatz) * Steuersatz
        return (price / (1 + self.tax_rate)) * self.tax_rate
