"""
Vereinskasse - Database Initialization
Datei: backend/app/db/init_db.py

Initialisiert Datenbank mit Default-Daten
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.security import SecurityService
from app.models.user import User
from app.models.products import Product, ProductCategory
from app.models.settings import SystemSettings
from app.core.config import settings


async def init_db(db: AsyncSession) -> None:
    """
    Initialisiert Datenbank mit Default-Daten
    
    Args:
        db: Database Session
    """
    
    # Prüfe ob bereits initialisiert
    result = await db.execute(select(User).where(User.is_admin == True))
    admin_exists = result.scalar_one_or_none()
    
    if admin_exists:
        print("✅ Datenbank bereits initialisiert")
        return
    
    print("🔧 Initialisiere Datenbank...")
    
    # 1. Admin User erstellen
    admin = User(
        username="admin",
        email="admin@vereinskasse.local",
        hashed_password=SecurityService.get_password_hash("admin123"),  # ÄNDERN!
        first_name="Admin",
        last_name="User",
        is_admin=True,
        is_active=True,
        balance=0.0
    )
    db.add(admin)
    
    # 2. Test-Mitglied erstellen
    test_member = User(
        username="test",
        email="test@vereinskasse.local",
        hashed_password=SecurityService.get_password_hash("test123"),
        first_name="Test",
        last_name="Mitglied",
        is_admin=False,
        is_active=True,
        balance=50.0
    )
    db.add(test_member)
    
    # 3. System Settings
    sys_settings = SystemSettings(
        sumup_mode=settings.SUMUP_MODE,
        default_language="de",
        maintenance_mode=False
    )
    db.add(sys_settings)
    
    # 4. Beispiel-Produkte
    products = [
        # Getränke
        Product(
            name="Bier",
            variant="0.5L",
            category=ProductCategory.DRINKS,
            member_price=2.50,
            guest_price=3.50,
            tax_rate=0.19,
            is_available=True,
            sort_order=1
        ),
        Product(
            name="Cola",
            variant="0.33L",
            category=ProductCategory.DRINKS,
            member_price=2.00,
            guest_price=2.50,
            tax_rate=0.19,
            is_available=True,
            sort_order=2
        ),
        Product(
            name="Wasser",
            variant="0.5L",
            category=ProductCategory.DRINKS,
            member_price=1.50,
            guest_price=2.00,
            tax_rate=0.07,
            is_available=True,
            sort_order=3
        ),
        # Snacks
        Product(
            name="Chips",
            category=ProductCategory.SNACKS,
            member_price=1.50,
            guest_price=2.00,
            tax_rate=0.19,
            is_available=True,
            sort_order=10
        ),
        Product(
            name="Erdnüsse",
            category=ProductCategory.SNACKS,
            member_price=1.00,
            guest_price=1.50,
            tax_rate=0.07,
            is_available=True,
            sort_order=11
        ),
        # Speisen
        Product(
            name="Bratwurst",
            category=ProductCategory.FOOD,
            member_price=3.00,
            guest_price=4.00,
            tax_rate=0.07,
            is_available=True,
            sort_order=20
        ),
        Product(
            name="Pommes",
            category=ProductCategory.FOOD,
            member_price=2.50,
            guest_price=3.00,
            tax_rate=0.07,
            is_available=True,
            sort_order=21
        ),
    ]
    
    for product in products:
        db.add(product)
    
    await db.commit()
    
    print("✅ Datenbank initialisiert!")
    print("   Admin: admin / admin123")
    print("   Test: test / test123")
    print(f"   {len(products)} Produkte erstellt")
