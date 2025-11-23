"""
Vereinskasse - Core Configuration (VEREINFACHT)
"""
import os
from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings
import secrets

class Settings(BaseSettings):
    model_config = {
        "case_sensitive": True,
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }
    
    APP_NAME: str = "Vereinskasse"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "production"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4
    RELOAD: bool = False
    
    POSTGRES_USER: str = "vereinskasse"
    POSTGRES_PASSWORD: str = "changeme123"
    POSTGRES_DB: str = "vereinskasse_db"
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432
    
    # Email Settings
    SMTP_HOST: str = os.getenv("SMTP_HOST", "localhost")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "465"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM: str = os.getenv("SMTP_FROM", "noreply@example.com")
    SMTP_FROM_NAME: str = os.getenv("SMTP_FROM_NAME", "Vereinskasse")

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS - EINFACH als String
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:8001"
    CORS_ALLOW_CREDENTIALS: bool = True
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]
    
    SUMUP_API_KEY: str = "your_api_key_here"
    SUMUP_MERCHANT_CODE: str = "your_merchant_code"
    SUMUP_AFFILIATE_KEY: str = "your_affiliate_key"
    SUMUP_READER_ID: Optional[str] = None
    SUMUP_MODE: str = "cloud_api"
    SUMUP_API_BASE_URL: str = "https://api.sumup.com/v0.1"
    SUMUP_POLLING_INTERVAL: int = 3
    SUMUP_POLLING_TIMEOUT: int = 120
    
    MEMBER_CREDIT_LIMIT: float = -15.00
    DEFAULT_CURRENCY: str = "EUR"
    MEMBER_FEE_RATE: float = 0.0139
    PAYMENT_LINK_FEE_RATE: float = 0.025
    
    DEFAULT_TAX_RATE_FOOD: float = 0.07
    DEFAULT_TAX_RATE_DRINKS: float = 0.19
    MEMBER_TAX_EXEMPT: bool = True
    
    MAX_UPLOAD_SIZE: int = 10485760
    UPLOAD_DIR: str = "./uploads"
    BACKUP_DIR: str = "./backups"
    BACKUP_RETENTION_DAYS: int = 60
    
    RFID_ENABLED: bool = True
    RFID_READER_TYPE: str = "USB"
    RFID_DEVICE_PATH: str = "/dev/ttyUSB0"
    
    DEFAULT_LANGUAGE: str = "de"
    TIMEZONE: str = "Europe/Berlin"
    
    @property
    def is_development(self) -> bool:
        return self.APP_ENV == "development"
    
    @property
    def database_url_sync(self) -> str:
        return self.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

settings = Settings()

