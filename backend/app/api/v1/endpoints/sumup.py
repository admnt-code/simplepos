"""
SumUp Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.db.session import get_db
from app.core.security import get_current_active_user, get_current_admin_user
from app.models.user import User
from app.services.sumup_service import SumUpService

router = APIRouter()


class TopUpRequest(BaseModel):
    amount: float
    payment_method: str = None  # Optional: "cloud_api" oder "payment_link"


class PairReaderRequest(BaseModel):
    pairing_code: str
    reader_name: str = "Vereinskasse Terminal"


@router.post("/topup")
async def create_topup(
    request: TopUpRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Guthaben aufladen"""
    sumup = SumUpService(db)
    result = await sumup.create_topup_checkout(
        user_id=current_user.id,
        amount=request.amount,
        payment_method=request.payment_method
    )
    return result


@router.get("/transactions/{transaction_id}/status")
async def get_transaction_status(
    transaction_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Transaction Status abrufen (für Polling)"""
    sumup = SumUpService(db)
    status = await sumup.get_transaction_status(transaction_id)
    return status


@router.post("/reader/pair")
async def pair_reader(
    request: PairReaderRequest,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Terminal pairen (nur Admin)"""
    sumup = SumUpService(db)
    result = await sumup.pair_reader(
        pairing_code=request.pairing_code,
        reader_name=request.reader_name
    )
    return result


@router.get("/reader/status")
async def get_reader_status(
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Terminal Status (nur Admin)"""
    sumup = SumUpService(db)
    status = await sumup.get_reader_status()
    return status
