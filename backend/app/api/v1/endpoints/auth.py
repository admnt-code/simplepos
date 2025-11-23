"""
Auth Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from pydantic import BaseModel
from app.db.session import get_db
from app.services.auth_service import AuthService
from app.core.security import create_token_pair, get_current_user, SecurityService
from app.schemas.user import LoginRequest, RFIDLoginRequest, Token
from app.models.user import User

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


class PasswordChangeRequest(BaseModel):
    new_password: str


@router.put("/change-password")
async def change_password(
    password_data: PasswordChangeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Change user password (authenticated user only)
    """
    # Validate new password
    if len(password_data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Neues Passwort muss mindestens 6 Zeichen lang sein"
        )
    
    # Update password
    current_user.hashed_password = SecurityService.get_password_hash(password_data.new_password)
    await db.commit()
    
    return {"message": "Passwort erfolgreich geändert"}
