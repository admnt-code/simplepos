"""
Health Check Endpoint - Service Monitoring
Überwacht externe Services (NICHT das lokale System selbst):
- Internet-Verfügbarkeit
- SumUp API Status
"""
from fastapi import APIRouter
import httpx
from pydantic import BaseModel
from typing import Literal

router = APIRouter()


class HealthStatus(BaseModel):
    """Service Health Status Response"""
    internet: Literal["ok", "error"]
    internet_message: str
    sumup: Literal["ok", "mock", "error"]
    sumup_message: str


async def check_internet() -> bool:
    """
    Prüft ob Internet verfügbar ist durch Aufruf eines externen Services
    Dies testet die Internetverbindung vom Backend aus
    """
    try:
        async with httpx.AsyncClient() as client:
            # Versuche Google DNS zu erreichen (schnell und zuverlässig)
            response = await client.get("https://dns.google/", timeout=5.0)
            return response.status_code == 200
    except Exception:
        return False


async def check_sumup() -> tuple[str, str]:
    """
    Prüft SumUp API Status
    Aktuell Mock-Modus bis API Keys konfiguriert sind
    
    TODO: Wenn API Keys verfügbar sind, echten Check implementieren:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.sumup.com/v0.1/me",
            headers={"Authorization": f"Bearer {SUMUP_API_KEY}"},
            timeout=5.0
        )
        if response.status_code == 200:
            return "ok", "SumUp API erreichbar"
        else:
            return "error", f"SumUp API Fehler: {response.status_code}"
    """
    # Mock-Status bis Keys konfiguriert sind
    return "mock", "SumUp Mock-Modus"


@router.get("/", response_model=HealthStatus)
async def health_check():
    """
    Service Health Check Endpoint
    
    Überwacht externe Services (NICHT das lokale System):
    - Internet-Verfügbarkeit (vom Backend aus)
    - SumUp API Status
    
    Hinweis: Wenn Backend/Frontend down sind, lädt die Seite nicht.
    Dies ist nur für Service-Checks während das System läuft.
    """
    # Check Internet
    internet_ok = await check_internet()
    internet_status = "ok" if internet_ok else "error"
    internet_message = "Internet verbunden" if internet_ok else "Keine Internetverbindung"
    
    # Check SumUp
    sumup_status, sumup_message = await check_sumup()
    
    return HealthStatus(
        internet=internet_status,
        internet_message=internet_message,
        sumup=sumup_status,
        sumup_message=sumup_message,
    )
