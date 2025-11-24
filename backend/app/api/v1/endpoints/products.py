"""
Product Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.services.product_service import ProductService
from app.schemas.product import ProductResponse, ProductCreate, ProductUpdate
from app.models.products import ProductCategory, Product
from app.core.security import get_current_admin_user
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=list[ProductResponse])
async def get_products(
    category: ProductCategory = None,
    available_only: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """Alle Produkte abrufen"""
    service = ProductService(db)
    products = await service.get_all_products(category, available_only)
    return products


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Einzelnes Produkt"""
    service = ProductService(db)
    product = await service.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Produkt nicht gefunden")
    return product


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Neues Produkt erstellen (Admin only)
    """
    # Create product
    product = Product(
        name=product_data.name,
        description=product_data.description,
        category=product_data.category,
        variant=product_data.variant,
        member_price=product_data.member_price,
        guest_price=product_data.guest_price,
        tax_rate=product_data.tax_rate or 0.19,
        stock_quantity=product_data.stock_quantity,
        track_stock=product_data.track_stock or False,
        is_available=product_data.is_available if product_data.is_available is not None else True,
        sort_order=product_data.sort_order or 0,
    )
    
    db.add(product)
    await db.commit()
    await db.refresh(product)
    
    return product


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Produkt aktualisieren (Admin only)
    """
    # Find product
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produkt nicht gefunden"
        )
    
    # Update fields
    update_data = product_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    await db.commit()
    await db.refresh(product)
    
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Produkt löschen (Admin only)
    """
    # Find product
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produkt nicht gefunden"
        )
    
    await db.delete(product)
    await db.commit()
    
    return None
