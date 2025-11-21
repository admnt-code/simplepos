"""
Auth Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.db.session import get_db
from app.services.auth_service import AuthService
from app.core.security import create_token_pair
from app.schemas.user import LoginRequest, RFIDLoginRequest, Token

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Login mit Username und Passwort"""
    auth_service = AuthService(db)
    user = await auth_service.authenticate_user(
        credentials.username,
        credentials.password
    )
    
    # Update last_login
    user.last_login = datetime.utcnow()
    await db.commit()
    
    return create_token_pair(user.id)


@router.post("/login/rfid", response_model=Token)
async def login_rfid(
    credentials: RFIDLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Login mit RFID-Token"""
    auth_service = AuthService(db)
    user = await auth_service.authenticate_rfid(credentials.rfid_token)
    
    user.last_login = datetime.utcnow()
    await db.commit()
    
    return create_token_pair(user.id)
