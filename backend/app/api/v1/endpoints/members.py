"""
Member Endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.services.member_service import MemberService
from app.schemas.user import UserResponse
from app.schemas.transaction import TransactionResponse, PurchaseResponse

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """Aktueller User Info"""
    return current_user


@router.get("/balance")
async def get_balance(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Guthaben abrufen"""
    service = MemberService(db)
    balance = await service.get_balance(current_user.id)
    return {"balance": balance}


@router.get("/transactions", response_model=list[TransactionResponse])
async def get_transactions(
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Transaktionshistorie"""
    service = MemberService(db)
    transactions = await service.get_transaction_history(current_user.id, limit)
    return transactions


@router.get("/purchases", response_model=list[PurchaseResponse])
async def get_purchases(
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Kaufhistorie"""
    service = MemberService(db)
    purchases = await service.get_purchase_history(current_user.id, limit)
    return purchases
