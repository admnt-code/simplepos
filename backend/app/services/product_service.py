"""
Product Service
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.products import Product, ProductCategory


class ProductService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_all_products(
        self,
        category: ProductCategory = None,
        available_only: bool = True
    ) -> list[Product]:
        query = select(Product)
        
        if available_only:
            query = query.where(Product.is_available == True)
        
        if category:
            query = query.where(Product.category == category)
        
        query = query.order_by(Product.sort_order, Product.name)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_product_by_id(self, product_id: int) -> Product:
        result = await self.db.execute(
            select(Product).where(Product.id == product_id)
        )
        return result.scalar_one_or_none()
