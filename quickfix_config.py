#!/bin/bash
#
# QUICK FIX - Pydantic Config Fehler beheben
#

set -e

echo "======================================"
echo "Vereinskasse - Config Quick Fix"
echo "======================================"

# 1. Backup alte Dateien
echo "1. Erstelle Backups..."
if [ -f "backend/app/core/config.py" ]; then
    cp backend/app/core/config.py backend/app/core/config.py.backup
    echo "   ✅ config.py gesichert"
fi

if [ -f "backend/app/main.py" ]; then
    cp backend/app/main.py backend/app/main.py.backup
    echo "   ✅ main.py gesichert"
fi

# 2. Korrigierte config.py erstellen
echo "2. Erstelle korrigierte config.py..."
cat > backend/app/core/config.py << 'CONFIGEOF'
"""
Vereinskasse - Core Configuration (VEREINFACHT)
"""
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
    
    # Application
    APP_NAME: str = "Vereinskasse"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "production"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4
    RELOAD: bool = False
    
    # Database
    POSTGRES_USER: str = "vereinskasse"
    POSTGRES_PASSWORD: str = "changeme123"
    POSTGRES_DB: str = "vereinskasse_db"
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # Security
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS - VEREINFACHT
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:8001"
    CORS_ALLOW_CREDENTIALS: bool = True
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]
    
    # SumUp
    SUMUP_API_KEY: str = "your_api_key_here"
    SUMUP_MERCHANT_CODE: str = "your_merchant_code"
    SUMUP_AFFILIATE_KEY: str = "your_affiliate_key"
    SUMUP_READER_ID: Optional[str] = None
    SUMUP_MODE: str = "cloud_api"
    SUMUP_API_BASE_URL: str = "https://api.sumup.com/v0.1"
    SUMUP_POLLING_INTERVAL: int = 3
    SUMUP_POLLING_TIMEOUT: int = 120
    
    # Payment
    MEMBER_CREDIT_LIMIT: float = -15.00
    DEFAULT_CURRENCY: str = "EUR"
    MEMBER_FEE_RATE: float = 0.0139
    PAYMENT_LINK_FEE_RATE: float = 0.025
    
    # Tax
    DEFAULT_TAX_RATE_FOOD: float = 0.07
    DEFAULT_TAX_RATE_DRINKS: float = 0.19
    MEMBER_TAX_EXEMPT: bool = True
    
    # Files
    MAX_UPLOAD_SIZE: int = 10485760
    UPLOAD_DIR: str = "./uploads"
    ALLOWED_EXTENSIONS: str = "jpg,jpeg,png,pdf"
    
    # Backup
    BACKUP_DIR: str = "./backups"
    BACKUP_RETENTION_DAYS: int = 60
    
    # RFID
    RFID_ENABLED: bool = True
    RFID_READER_TYPE: str = "USB"
    RFID_DEVICE_PATH: str = "/dev/ttyUSB0"
    
    # Features
    FEATURE_GUEST_SUMUP_PAYMENT: bool = True
    FEATURE_MEMBER_TRANSFER: bool = True
    
    # Locale
    DEFAULT_LANGUAGE: str = "de"
    SUPPORTED_LANGUAGES: str = "de,en"
    TIMEZONE: str = "Europe/Berlin"
    
    @property
    def is_development(self) -> bool:
        return self.APP_ENV == "development"
    
    @property
    def database_url_sync(self) -> str:
        return self.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

settings = Settings()
CONFIGEOF

echo "   ✅ config.py erstellt"

# 3. Korrigierte main.py erstellen
echo "3. Erstelle korrigierte main.py..."
cat > backend/app/main.py << 'MAINEOF'
"""
Vereinskasse - FastAPI Main Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.api.v1.api import api_router

logging.basicConfig(
    level=settings.LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Vereins-Kassensystem API",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"app": settings.APP_NAME, "version": settings.APP_VERSION, "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.on_event("startup")
async def startup_event():
    logger.info(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} starting...")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 Application shutting down...")
MAINEOF

echo "   ✅ main.py erstellt"

# 4. Docker Container neustarten
echo "4. Container neustarten..."
docker-compose -f docker-compose-backend.yml down
docker-compose -f docker-compose-backend.yml up -d --build

echo ""
echo "======================================"
echo "✅ Fix abgeschlossen!"
echo "======================================"
echo ""
echo "Warte 10 Sekunden..."
sleep 10

echo ""
echo "Prüfe Status:"
docker-compose -f docker-compose-backend.yml ps
echo ""
echo "Letzte Logs:"
docker-compose -f docker-compose-backend.yml logs --tail=20 backend
echo ""
echo "======================================"
echo "Test mit: curl http://localhost:8001/health"
echo "API Docs: http://localhost:8001/docs"
echo "======================================"
