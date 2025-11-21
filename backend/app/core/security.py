"""
Vereins-Kassensystem - Security Module
Datei: backend/app/core/security.py

JWT Token Handling, Password Hashing, Authentication
"""

from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import TokenData


# Password Hashing Context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 Scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


class SecurityService:
    """
    Service für Security-Operationen
    """
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verifiziert Passwort gegen Hash
        
        Args:
            plain_password: Klartext-Passwort
            hashed_password: Gehashtes Passwort
            
        Returns:
            bool: True wenn Passwort korrekt
        """
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """
        Hasht ein Passwort
        
        Args:
            password: Klartext-Passwort
            
        Returns:
            str: Gehashtes Passwort
        """
        return pwd_context.hash(password)
    
    @staticmethod
    def create_access_token(
        data: dict,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Erstellt JWT Access Token
        
        Args:
            data: Payload Data (z.B. {"sub": user_id})
            expires_delta: Optionale Custom Expiration
            
        Returns:
            str: JWT Token
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        })
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
        
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(
        data: dict,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Erstellt JWT Refresh Token
        
        Args:
            data: Payload Data (z.B. {"sub": user_id})
            expires_delta: Optionale Custom Expiration
            
        Returns:
            str: JWT Refresh Token
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                days=settings.REFRESH_TOKEN_EXPIRE_DAYS
            )
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh"
        })
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
        
        return encoded_jwt
    
    @staticmethod
    def decode_token(token: str) -> dict:
        """
        Dekodiert und validiert JWT Token
        
        Args:
            token: JWT Token
            
        Returns:
            dict: Decoded Payload
            
        Raises:
            HTTPException: Bei ungültigem Token
        """
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            return payload
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token konnte nicht validiert werden",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    @staticmethod
    def verify_rfid_token(rfid_token: str) -> bool:
        """
        Verifiziert RFID Token Format
        
        Args:
            rfid_token: RFID Token String
            
        Returns:
            bool: True wenn valide
        """
        # Implementiere RFID-spezifische Validierung
        if not rfid_token or len(rfid_token) < 8:
            return False
        
        # Hier können weitere RFID-Format-Checks hinzugefügt werden
        return True


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependency zum Abrufen des aktuellen Users aus Token
    
    Args:
        token: JWT Token aus Authorization Header
        db: Database Session
        
    Returns:
        User: Aktueller User
        
    Raises:
        HTTPException: Bei ungültigem Token oder User nicht gefunden
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Anmeldedaten konnten nicht validiert werden",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = SecurityService.decode_token(token)
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if user_id is None or token_type != "access":
            raise credentials_exception
            
        token_data = TokenData(user_id=int(user_id))
        
    except JWTError:
        raise credentials_exception
    
    # User aus DB laden
    from app.services.auth_service import AuthService
    auth_service = AuthService(db)
    user = await auth_service.get_user_by_id(token_data.user_id)
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Benutzer ist deaktiviert"
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency für aktiven User
    
    Args:
        current_user: User aus get_current_user
        
    Returns:
        User: Aktiver User
        
    Raises:
        HTTPException: Wenn User inaktiv
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Benutzer ist nicht aktiv"
        )
    return current_user


async def get_current_admin_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Dependency für Admin User
    
    Args:
        current_user: User aus get_current_active_user
        
    Returns:
        User: Admin User
        
    Raises:
        HTTPException: Wenn User kein Admin
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Keine Admin-Berechtigung"
        )
    return current_user


def create_token_pair(user_id: int) -> dict:
    """
    Erstellt Access und Refresh Token Pair
    
    Args:
        user_id: User ID
        
    Returns:
        dict: {"access_token": ..., "refresh_token": ..., "token_type": "bearer"}
    """
    access_token = SecurityService.create_access_token(
        data={"sub": str(user_id)}
    )
    refresh_token = SecurityService.create_refresh_token(
        data={"sub": str(user_id)}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
