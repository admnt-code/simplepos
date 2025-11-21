"""
Database Base - Import ALLER Models für SQLAlchemy
"""
from app.db.session import Base

# Import ALLE models hier damit SQLAlchemy sie kennt
from app.models.user import User
from app.models.guest import Guest
from app.models.products import Product
from app.models.transaction import Transaction
from app.models.purchase import Purchase
from app.models.settings import SystemSettings

# Wichtig: Alle müssen importiert sein, damit Relationships funktionieren!
