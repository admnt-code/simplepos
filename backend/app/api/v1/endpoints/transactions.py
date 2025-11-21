"""
Transaction Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.db.session import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionResponse, TopUpRequest
from app.models.transaction import TransactionStatus, PaymentMethod
from app.core.security import get_current_user
from datetime import datetime

router = APIRouter()


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction_data: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new transaction (Purchase from balance)
    """
    # Validate balance for purchases
    if transaction_data.payment_method == "balance":
        if current_user.balance < transaction_data.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient balance"
            )

        # Deduct from balance
        current_user.balance -= transaction_data.amount
    
    # Create transaction
    transaction = Transaction(
    transaction_reference=f"TXN-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{current_user.id}",  # NEU!
    user_id=current_user.id,
    transaction_type=transaction_data.transaction_type,
    amount=transaction_data.amount,
    payment_method=transaction_data.payment_method,
    description=transaction_data.description,
    status="successful",
    balance_before=(current_user.balance + transaction_data.amount) if transaction_data.payment_method == "balance" else None,
    balance_after=current_user.balance if transaction_data.payment_method == "balance" else None,
    created_at=datetime.utcnow(),
)

    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)

    return transaction


@router.post("/top-up", response_model=TransactionResponse)
async def top_up_balance(
    top_up_data: TopUpRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Top up user balance (with SumUp payment)
    """
    # TODO: Integrate with SumUp API
    # For now, we just create the transaction and add balance

    # Create transaction
    transaction = Transaction(
    transaction_reference=f"TOP-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{current_user.id}",  # NEU!
    user_id=current_user.id,
    transaction_type="top_up",
    amount=top_up_data.amount,
    payment_method=top_up_data.payment_method,
    description=f"Top-up {top_up_data.amount}€",
    status="successful",
    created_at=datetime.utcnow(),
)

    # Add to balance
    current_user.balance += top_up_data.amount

    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)

    return transaction


@router.get("/my", response_model=List[TransactionResponse])
async def get_my_transactions(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get current user's transactions
    """
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .order_by(Transaction.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    transactions = result.scalars().all()
    return transactions


@router.get("/", response_model=List[TransactionResponse])
async def get_all_transactions(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all transactions (Admin only)
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    result = await db.execute(
        select(Transaction)
        .order_by(Transaction.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    transactions = result.scalars().all()
    return transactions


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a specific transaction
    """
    result = await db.execute(
        select(Transaction).where(Transaction.id == transaction_id)
    )
    transaction = result.scalar_one_or_none()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    # Check permissions
    if not current_user.is_admin and transaction.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    return transaction
