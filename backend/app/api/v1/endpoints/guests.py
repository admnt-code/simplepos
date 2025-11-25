"""
Guest Management Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime
from typing import List

from app.db.session import get_db
from app.core.security import get_current_user, get_current_admin_user, get_current_user_optional
from app.models.user import User
from app.models.guest import Guest
from app.models.guest_tab import GuestTab
from app.models.products import Product
from app.models.transaction import Transaction, PaymentMethod
from app.schemas.guest import (
    GuestCreate,
    GuestUpdate,
    GuestResponse,
    GuestCloseTabRequest,
    GuestTabItemResponse,
)

router = APIRouter()


@router.get("/", response_model=List[GuestResponse])
async def get_guests(
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    """
    Alle Gäste abrufen
    """
    query = select(Guest)
    
    if active_only:
        query = query.where(Guest.closed_at.is_(None))
    
    query = query.order_by(Guest.created_at.desc())
    
    result = await db.execute(query)
    guests = result.scalars().all()
    
    # Load tab items for each guest
    response = []
    for guest in guests:
        tab_items_result = await db.execute(
            select(GuestTab, Product)
            .join(Product)
            .where(GuestTab.guest_id == guest.id)
            .order_by(GuestTab.created_at)
        )
        tab_items_data = tab_items_result.all()
        
        tab_items = [
            GuestTabItemResponse(
                id=item.GuestTab.id,
                product_id=item.Product.id,
                product_name=item.Product.name,
                quantity=item.GuestTab.quantity,
                price_per_item=item.GuestTab.price_per_item,
                total_amount=item.GuestTab.total_amount,
                created_at=item.GuestTab.created_at,
                paid=item.GuestTab.paid,
            )
            for item in tab_items_data
        ]
        
        response.append(
            GuestResponse(
                id=guest.id,
                name=guest.name,
                created_at=guest.created_at,
                closed_at=guest.closed_at,
                total_amount=guest.total_amount,
                is_active=guest.is_active,
                tab_items=tab_items,
            )
        )
    
    return response


@router.get("/{guest_id}", response_model=GuestResponse)
async def get_guest(
    guest_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Einzelnen Gast mit Tab-Details abrufen
    """
    result = await db.execute(
        select(Guest).where(Guest.id == guest_id)
    )
    guest = result.scalar_one_or_none()
    
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gast nicht gefunden"
        )
    
    # Load tab items
    tab_items_result = await db.execute(
        select(GuestTab, Product)
        .join(Product)
        .where(GuestTab.guest_id == guest.id)
        .order_by(GuestTab.created_at)
    )
    tab_items_data = tab_items_result.all()
    
    tab_items = [
        GuestTabItemResponse(
            id=item.GuestTab.id,
            product_id=item.Product.id,
            product_name=item.Product.name,
            quantity=item.GuestTab.quantity,
            price_per_item=item.GuestTab.price_per_item,
            total_amount=item.GuestTab.total_amount,
            created_at=item.GuestTab.created_at,
            paid=item.GuestTab.paid,
        )
        for item in tab_items_data
    ]
    
    return GuestResponse(
        id=guest.id,
        name=guest.name,
        created_at=guest.created_at,
        closed_at=guest.closed_at,
        total_amount=guest.total_amount,
        is_active=guest.is_active,
        tab_items=tab_items,
    )


@router.post("/", response_model=GuestResponse, status_code=status.HTTP_201_CREATED)
async def create_guest(
    guest_data: GuestCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Neuen Gast anlegen
    """
    guest = Guest(
        name=guest_data.name,
        total_amount=0.0,
    )
    
    db.add(guest)
    await db.commit()
    await db.refresh(guest)
    
    return GuestResponse(
        id=guest.id,
        name=guest.name,
        created_at=guest.created_at,
        closed_at=guest.closed_at,
        total_amount=guest.total_amount,
        is_active=guest.is_active,
        tab_items=[],
    )


@router.put("/{guest_id}", response_model=GuestResponse)
async def update_guest(
    guest_id: int,
    guest_data: GuestUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    Gast-Daten aktualisieren (nur wenn noch aktiv)
    """
    result = await db.execute(
        select(Guest).where(Guest.id == guest_id)
    )
    guest = result.scalar_one_or_none()
    
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gast nicht gefunden"
        )
    
    # Nur aktive Gäste können bearbeitet werden
    if not guest.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gast ist bereits abgerechnet und kann nicht bearbeitet werden"
        )
    
    if guest_data.name is not None:
        guest.name = guest_data.name
    
    await db.commit()
    await db.refresh(guest)
    
    return GuestResponse(
        id=guest.id,
        name=guest.name,
        created_at=guest.created_at,
        closed_at=guest.closed_at,
        total_amount=guest.total_amount,
        is_active=guest.is_active,
        tab_items=[],
    )

@router.post("/{guest_id}/add-item")
async def add_item_to_tab(
    guest_id: int,
    product_id: int,
    quantity: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Artikel zum Gast-Tab hinzufügen
    """
    # Get guest
    result = await db.execute(
        select(Guest).where(Guest.id == guest_id)
    )
    guest = result.scalar_one_or_none()
    
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gast nicht gefunden"
        )
    
    if not guest.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gast-Tab ist bereits geschlossen"
        )
    
    # Get product
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produkt nicht gefunden"
        )
    
    # Create tab item
    price_per_item = product.guest_price
    total_amount = price_per_item * quantity
    
    tab_item = GuestTab(
        guest_id=guest.id,
        product_id=product.id,
        quantity=quantity,
        price_per_item=price_per_item,
        total_amount=total_amount,
    )
    
    db.add(tab_item)
    
    # Update guest total
    guest.total_amount += total_amount
    
    await db.commit()
    
    return {"message": "Artikel zum Tab hinzugefügt", "total": guest.total_amount}


@router.post("/{guest_id}/close-tab")
async def close_guest_tab(
    guest_id: int,
    close_data: GuestCloseTabRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_optional),
):
    """
    Gast-Tab schließen und Transaktion erstellen
    """
    # Get guest with tab items
    result = await db.execute(
        select(Guest).where(Guest.id == guest_id)
    )
    guest = result.scalar_one_or_none()
    
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gast nicht gefunden"
        )
    
    if not guest.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gast-Tab ist bereits geschlossen"
        )
    
    # Get unpaid tab items
    result = await db.execute(
        select(GuestTab).where(
            and_(
                GuestTab.guest_id == guest.id,
                GuestTab.paid == False
            )
        )
    )
    unpaid_items = result.scalars().all()
    
    if not unpaid_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Keine offenen Positionen auf dem Tab"
        )
    
    # Calculate total
    total = sum(item.total_amount for item in unpaid_items)
    
    # Create transaction
    from uuid import uuid4
    transaction = Transaction(
        transaction_reference=f"GUEST-{uuid4().hex[:12].upper()}",
        user_id=None,
        guest_id=guest.id,
        transaction_type="purchase",
        status="successful",
        amount=total,
        payment_method=close_data.payment_method,
        description=f"Gast-Rechnung: {guest.name}",
        created_by_admin_id=current_user.id if current_user else None,
        completed_at=datetime.utcnow(),
    )
    
    db.add(transaction)
    
    # Mark all items as paid
    for item in unpaid_items:
        item.paid = True
    
    # Close guest
    guest.closed_at = datetime.utcnow()
    
    await db.commit()
    
    return {
        "message": "Tab geschlossen",
        "transaction_id": transaction.id,
        "total": total,
        "payment_method": close_data.payment_method,
    }


@router.delete("/{guest_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_guest(
    guest_id: int,
    db: AsyncSession = Depends(get_db),
    # Kein Admin nötig mehr
):
    """
    Gast löschen (nur wenn Tab leer und nicht geschlossen)
    """
    result = await db.execute(
        select(Guest).where(Guest.id == guest_id)
    )
    guest = result.scalar_one_or_none()
    
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gast nicht gefunden"
        )
    
    # Prüfe ob Tab leer ist
    if guest.total_amount > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gast kann nicht gelöscht werden - Tab hat bereits Positionen"
        )
    
    # Prüfe ob Gast geschlossen ist
    if not guest.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gast ist bereits abgerechnet und kann nicht gelöscht werden"
        )
    
    await db.delete(guest)
    await db.commit()
    
    return None
