"""
Member Service  
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from fastapi import HTTPException
from app.models.user import User
from app.models.transaction import Transaction
from app.models.purchase import Purchase
from app.core.config import settings


class MemberService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_balance(self, user_id: int) -> float:
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        return user.balance if user else 0.0
    
    async def can_purchase(self, user_id: int, amount: float) -> bool:
        balance = await self.get_balance(user_id)
        return balance - amount >= settings.MEMBER_CREDIT_LIMIT
    
    async def get_transaction_history(
        self,
        user_id: int,
        limit: int = 50
    ) -> list[Transaction]:
        result = await self.db.execute(
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(desc(Transaction.created_at))
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_purchase_history(
        self,
        user_id: int,
        limit: int = 50
    ) -> list[Purchase]:
        result = await self.db.execute(
            select(Purchase)
            .where(Purchase.user_id == user_id)
            .order_by(desc(Purchase.created_at))
            .limit(limit)
        )
        return result.scalars().all()
