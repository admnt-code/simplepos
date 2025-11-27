"""
Transaction Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import cm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.models.guest import Guest
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
            # Prüfe ob mit Dispo möglich
            new_balance = current_user.balance - transaction_data.amount
            if new_balance < -15.0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient balance. Maximum overdraft is -15.00€"
                )

        # Deduct from balance
        current_user.balance -= transaction_data.amount

    # Create transaction
    transaction = Transaction(
    transaction_reference=f"TXN-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{current_user.id}",
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
    transaction_reference=f"TOP-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{current_user.id}",
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
    user_type: str = 'all',
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all transactions (Admin only)
    Filter by user_type: 'all', 'members', 'guests'
    Returns transactions with user/guest names
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    # Build query with filter
    query = select(Transaction).options(
        selectinload(Transaction.user),
        selectinload(Transaction.guest)
    )

    if user_type == 'members':
        query = query.where(Transaction.user_id.is_not(None))
    elif user_type == 'guests':
        query = query.where(Transaction.guest_id.is_not(None))
    # 'all' = no filter

    query = query.order_by(Transaction.created_at.desc()).offset(skip).limit(limit)

    result = await db.execute(query)
    transactions = result.scalars().all()
    
    # Manuell die Namen hinzufügen
    response_data = []
    for txn in transactions:
        txn_dict = {
            "id": txn.id,
            "transaction_reference": txn.transaction_reference,
            "user_id": txn.user_id,
            "guest_id": txn.guest_id,
            "transaction_type": txn.transaction_type,
            "status": txn.status,
            "amount": txn.amount,
            "balance_before": txn.balance_before,
            "balance_after": txn.balance_after,
            "payment_method": txn.payment_method,
            "description": txn.description,
            "created_at": txn.created_at,
            "completed_at": txn.completed_at,
            # Namen hinzufügen
            "user_first_name": txn.user.first_name if txn.user else None,
            "user_last_name": txn.user.last_name if txn.user else None,
            "guest_name": txn.guest.name if txn.guest else None,
        }
        response_data.append(txn_dict)
    
    return response_data

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

@router.get("/export/pdf")
async def export_transactions_pdf(
    user_type: str = 'all',
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Export transactions as PDF (Admin only)
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    # Get transactions with filter and load relationships
    query = select(Transaction).options(
        selectinload(Transaction.user),
        selectinload(Transaction.guest)
    )

    if user_type == 'members':
        query = query.where(Transaction.user_id.is_not(None))
    elif user_type == 'guests':
        query = query.where(Transaction.guest_id.is_not(None))

    query = query.order_by(Transaction.created_at.desc())

    result = await db.execute(query)
    transactions = result.scalars().all()

    # Create PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []

    styles = getSampleStyleSheet()

    # Title
    title_text = f"Transaktionen - {user_type.upper()}"
    title = Paragraph(title_text, styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 0.5*cm))

    # Date
    date_text = f"Erstellt am: {datetime.utcnow().strftime('%d.%m.%Y %H:%M')}"
    elements.append(Paragraph(date_text, styles['Normal']))
    elements.append(Spacer(1, 1*cm))

    # Table data
    data = [['Datum', 'Typ', 'Benutzer', 'Betrag', 'Status', 'Zahlungsart']]

    for txn in transactions:
        # Zeige Namen statt IDs
        if txn.user:
            user_info = f"{txn.user.first_name} {txn.user.last_name}"
        elif txn.guest:
            user_info = f"Gast: {txn.guest.name}"
        else:
            user_info = "System"

        data.append([
            txn.created_at.strftime('%d.%m.%Y %H:%M'),
            txn.transaction_type,
            user_info,
            f"{txn.amount:.2f} €",
            txn.status,
            txn.payment_method or '-'
        ])

    # Create table
    table = Table(data, colWidths=[4*cm, 3*cm, 3*cm, 2.5*cm, 2.5*cm, 3*cm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
    ]))

    elements.append(table)

    # Build PDF
    doc.build(elements)
    buffer.seek(0)

    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=transaktionen_{user_type}_{datetime.utcnow().strftime('%Y%m%d')}.pdf"
        }
    )
