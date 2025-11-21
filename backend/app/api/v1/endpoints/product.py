"""
Product Endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.product_service import ProductService
from app.schemas.product import ProductResponse
from app.models.products import ProductCategory

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
