"""
Auth Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from pydantic import BaseModel
import random  # NEU
from sqlalchemy import select
from app.db.session import get_db
from app.services.auth_service import AuthService
from app.core.security import create_token_pair, get_current_user, SecurityService
from app.schemas.user import LoginRequest, RFIDLoginRequest, Token
from app.models.user import User
from app.models.password_reset import PasswordResetCode  # NEU
from app.services.email_service import EmailService  # NEU

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

# ... (bestehender Code bis change_password)

    return {"message": "Passwort erfolgreich geändert"}


# ========== NEU: Password Reset Endpoints ==========

class PasswordResetRequest(BaseModel):
    email: str


class PasswordResetVerify(BaseModel):
    email: str
    code: str
    new_password: str


@router.post("/request-reset")
async def request_password_reset(
    request: PasswordResetRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Request password reset code via email
    """
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == request.email)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        # Don't reveal if email exists or not (security)
        return {"message": "Falls die Email existiert, wurde ein Code gesendet"}
    
    # Generate 6-digit code
    code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    
    # Save code to database
    reset_code = PasswordResetCode(
        user_id=user.id,
        code=code,
        expires_at=datetime.utcnow() + timedelta(hours=1),
        used=False
    )
    db.add(reset_code)
    await db.commit()
    
    # Send email
    email_sent = EmailService.send_password_reset_email(
        email=user.email,
        code=code,
        first_name=user.first_name
    )
    
    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Fehler beim Senden der Email"
        )
    
    return {"message": "Falls die Email existiert, wurde ein Code gesendet"}


@router.post("/verify-reset")
async def verify_password_reset(
    request: PasswordResetVerify,
    db: AsyncSession = Depends(get_db),
):
    """
    Verify reset code and change password
    """
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == request.email)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ungültiger Code oder Email"
        )
    
    # Find valid reset code
    result = await db.execute(
        select(PasswordResetCode)
        .where(
            PasswordResetCode.user_id == user.id,
            PasswordResetCode.code == request.code,
            PasswordResetCode.used == False,
            PasswordResetCode.expires_at > datetime.utcnow()
        )
        .order_by(PasswordResetCode.created_at.desc())
    )
    reset_code = result.scalar_one_or_none()
    
    if not reset_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ungültiger oder abgelaufener Code"
        )
    
    # Validate new password
    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwort muss mindestens 6 Zeichen lang sein"
        )
    
    # Update password
    user.hashed_password = SecurityService.get_password_hash(request.new_password)
    
    # Mark code as used
    reset_code.used = True
    
    await db.commit()
    
    return {"message": "Passwort erfolgreich geändert"}
