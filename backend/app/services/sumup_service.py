"""
Vereinskasse - SumUp Service
Datei: backend/app/services/sumup_service.py

KRITISCH: SumUp Cloud API Integration mit Polling
"""

import asyncio
import httpx
import qrcode
import io
import base64
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.models.transaction import Transaction, TransactionType, TransactionStatus, PaymentMethod
from app.models.user import User
from app.models.settings import SystemSettings


class SumUpService:
    """
    Service für SumUp Integration (Cloud API + Payment Links)
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.api_base_url = settings.SUMUP_API_BASE_URL
        self.api_key = settings.SUMUP_API_KEY
        self.merchant_code = settings.SUMUP_MERCHANT_CODE
        self.affiliate_key = settings.SUMUP_AFFILIATE_KEY
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def get_sumup_mode(self) -> str:
        """
        Holt aktuellen SumUp Mode aus System Settings
        
        Returns:
            str: "cloud_api" oder "payment_link"
        """
        result = await self.db.execute(
            select(SystemSettings).where(SystemSettings.id == 1)
        )
        sys_settings = result.scalar_one_or_none()
        
        if sys_settings:
            return sys_settings.sumup_mode
        return settings.SUMUP_MODE
    
    async def get_reader_id(self) -> Optional[str]:
        """
        Holt Reader ID aus System Settings
        
        Returns:
            Optional[str]: Reader ID oder None
        """
        result = await self.db.execute(
            select(SystemSettings).where(SystemSettings.id == 1)
        )
        sys_settings = result.scalar_one_or_none()
        
        if sys_settings and sys_settings.sumup_reader_id:
            return sys_settings.sumup_reader_id
        return settings.SUMUP_READER_ID
    
    # ==========================================
    # CLOUD API METHODS
    # ==========================================
    
    async def create_cloud_api_checkout(
        self,
        amount: float,
        description: str,
        transaction_reference: str
    ) -> Dict[str, Any]:
        """
        Erstellt Checkout via Cloud API
        
        Args:
            amount: Betrag in EUR
            description: Beschreibung
            transaction_reference: Eindeutige Referenz
            
        Returns:
            Dict mit Checkout-Daten
            
        Raises:
            Exception: Bei API-Fehler
        """
        reader_id = await self.get_reader_id()
        
        if not reader_id:
            raise ValueError("Kein Terminal (Reader) konfiguriert. Bitte Terminal pairen.")
        
        payload = {
            "checkout_reference": transaction_reference,
            "amount": amount,
            "currency": settings.DEFAULT_CURRENCY,
            "merchant_code": self.merchant_code,
            "description": description,
            "reader": {
                "id": reader_id
            }
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.api_base_url}/checkouts",
                    json=payload,
                    headers=self.headers
                )
                response.raise_for_status()
                return response.json()
                
            except httpx.HTTPStatusError as e:
                error_detail = e.response.json() if e.response.text else str(e)
                raise Exception(f"SumUp API Error: {error_detail}")
            except Exception as e:
                raise Exception(f"SumUp Request Failed: {str(e)}")
    
    async def get_checkout_status(self, checkout_id: str) -> Dict[str, Any]:
        """
        Holt Checkout Status von SumUp
        
        Args:
            checkout_id: SumUp Checkout ID
            
        Returns:
            Dict mit Status-Informationen
        """
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(
                    f"{self.api_base_url}/checkouts/{checkout_id}",
                    headers=self.headers
                )
                response.raise_for_status()
                return response.json()
                
            except Exception as e:
                raise Exception(f"Status Check Failed: {str(e)}")
    
    async def poll_checkout_status(
        self,
        checkout_id: str,
        transaction_id: int,
        max_attempts: int = None,
        interval: int = None
    ) -> None:
        """
        Pollt Checkout Status bis Completion oder Timeout
        
        Args:
            checkout_id: SumUp Checkout ID
            transaction_id: Interne Transaction ID
            max_attempts: Max Polling-Versuche (default: aus config)
            interval: Polling-Interval in Sekunden (default: aus config)
        """
        if max_attempts is None:
            max_attempts = settings.SUMUP_POLLING_TIMEOUT // settings.SUMUP_POLLING_INTERVAL
        
        if interval is None:
            interval = settings.SUMUP_POLLING_INTERVAL
        
        attempt = 0
        
        while attempt < max_attempts:
            try:
                # Status abrufen
                status_data = await self.get_checkout_status(checkout_id)
                status = status_data.get("status")
                
                # Transaction aus DB laden
                result = await self.db.execute(
                    select(Transaction).where(Transaction.id == transaction_id)
                )
                transaction = result.scalar_one_or_none()
                
                if not transaction:
                    print(f"⚠️  Transaction {transaction_id} nicht gefunden")
                    break
                
                if status == "SUCCESSFUL":
                    # Erfolgreiche Zahlung
                    await self._process_successful_payment(
                        transaction,
                        status_data
                    )
                    print(f"✅ Zahlung erfolgreich: {checkout_id}")
                    break
                    
                elif status == "FAILED":
                    # Fehlgeschlagene Zahlung
                    transaction.status = TransactionStatus.FAILED
                    await self.db.commit()
                    print(f"❌ Zahlung fehlgeschlagen: {checkout_id}")
                    break
                
                # Status noch PENDING → weiter warten
                await asyncio.sleep(interval)
                attempt += 1
                
            except Exception as e:
                print(f"⚠️  Polling Error (Attempt {attempt}): {e}")
                await asyncio.sleep(interval)
                attempt += 1
        
        # Timeout erreicht
        if attempt >= max_attempts:
            result = await self.db.execute(
                select(Transaction).where(Transaction.id == transaction_id)
            )
            transaction = result.scalar_one_or_none()
            
            if transaction and transaction.status == TransactionStatus.PENDING:
                transaction.status = TransactionStatus.FAILED
                await self.db.commit()
                print(f"⏱️  Timeout: {checkout_id}")
    
    async def _process_successful_payment(
        self,
        transaction: Transaction,
        sumup_data: Dict[str, Any]
    ) -> None:
        """
        Verarbeitet erfolgreiche Zahlung
        
        Args:
            transaction: Transaction Objekt
            sumup_data: SumUp Response Data
        """
        # Update Transaction
        transaction.status = TransactionStatus.SUCCESSFUL
        transaction.sumup_transaction_code = sumup_data.get("transaction_code")
        transaction.completed_at = datetime.utcnow()
        
        # Update User Balance
        if transaction.user_id:
            result = await self.db.execute(
                select(User).where(User.id == transaction.user_id)
            )
            user = result.scalar_one_or_none()
            
            if user:
                transaction.balance_before = user.balance
                user.balance += transaction.amount
                transaction.balance_after = user.balance
        
        await self.db.commit()
    
    # ==========================================
    # PAYMENT LINK METHODS
    # ==========================================
    
    async def create_payment_link(
        self,
        amount: float,
        description: str,
        transaction_reference: str
    ) -> Dict[str, Any]:
        """
        Erstellt Payment Link
        
        Args:
            amount: Betrag in EUR
            description: Beschreibung
            transaction_reference: Eindeutige Referenz
            
        Returns:
            Dict mit Payment Link URL und QR-Code
        """
        # Payment Link über SumUp API erstellen
        payload = {
            "checkout_reference": transaction_reference,
            "amount": amount,
            "currency": settings.DEFAULT_CURRENCY,
            "merchant_code": self.merchant_code,
            "description": description,
            "pay_to_email": settings.SMTP_FROM if settings.SMTP_ENABLED else None
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.api_base_url}/checkouts",
                    json=payload,
                    headers=self.headers
                )
                response.raise_for_status()
                checkout_data = response.json()
                
                # Payment URL konstruieren
                checkout_id = checkout_data.get("id")
                payment_url = f"https://pay.sumup.com/b2c/{self.merchant_code}/{checkout_id}"
                
                # QR-Code generieren
                qr_code_base64 = self._generate_qr_code(payment_url)
                
                return {
                    "checkout_id": checkout_id,
                    "payment_url": payment_url,
                    "qr_code": qr_code_base64,
                    "amount": amount,
                    "description": description
                }
                
            except Exception as e:
                raise Exception(f"Payment Link Creation Failed: {str(e)}")
    
    def _generate_qr_code(self, data: str) -> str:
        """
        Generiert QR-Code als Base64 String
        
        Args:
            data: Zu encodierender String (URL)
            
        Returns:
            str: Base64-encodiertes PNG
        """
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to Base64
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_base64}"
    
    # ==========================================
    # HIGH-LEVEL METHODS
    # ==========================================
    
    async def create_topup_checkout(
        self,
        user_id: int,
        amount: float,
        payment_method: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Erstellt Aufladungs-Checkout (Cloud API oder Payment Link)
        
        Args:
            user_id: User ID
            amount: Auflade-Betrag
            payment_method: Optional "cloud_api" oder "payment_link" (sonst aus Settings)
            
        Returns:
            Dict mit Checkout-Informationen
        """
        # Mode bestimmen
        if payment_method is None:
            payment_method = await self.get_sumup_mode()
        
        # Transaction erstellen
        transaction = Transaction(
            transaction_reference=Transaction.generate_reference(TransactionType.TOP_UP),
            user_id=user_id,
            transaction_type=TransactionType.TOP_UP,
            status=TransactionStatus.PENDING,
            amount=amount,
            payment_method=PaymentMethod.SUMUP_CLOUD_API if payment_method == "cloud_api" else PaymentMethod.SUMUP_PAYMENT_LINK,
            description=f"Guthaben-Aufladung: {amount}€"
        )
        
        self.db.add(transaction)
        await self.db.commit()
        await self.db.refresh(transaction)
        
        # Checkout erstellen
        if payment_method == "cloud_api":
            # Cloud API Checkout
            checkout_data = await self.create_cloud_api_checkout(
                amount=amount,
                description=transaction.description,
                transaction_reference=transaction.transaction_reference
            )
            
            transaction.sumup_checkout_id = checkout_data.get("id")
            await self.db.commit()
            
            # Polling im Hintergrund starten
            asyncio.create_task(
                self.poll_checkout_status(
                    checkout_id=checkout_data.get("id"),
                    transaction_id=transaction.id
                )
            )
            
            return {
                "transaction_id": transaction.id,
                "checkout_id": checkout_data.get("id"),
                "method": "cloud_api",
                "status": "pending",
                "message": "Bitte am Terminal bezahlen"
            }
            
        else:
            # Payment Link
            link_data = await self.create_payment_link(
                amount=amount,
                description=transaction.description,
                transaction_reference=transaction.transaction_reference
            )
            
            transaction.sumup_checkout_id = link_data.get("checkout_id")
            await self.db.commit()
            
            # Polling im Hintergrund starten
            asyncio.create_task(
                self.poll_checkout_status(
                    checkout_id=link_data.get("checkout_id"),
                    transaction_id=transaction.id
                )
            )
            
            return {
                "transaction_id": transaction.id,
                "checkout_id": link_data.get("checkout_id"),
                "method": "payment_link",
                "payment_url": link_data.get("payment_url"),
                "qr_code": link_data.get("qr_code"),
                "status": "pending",
                "message": "Bitte QR-Code scannen oder Link öffnen"
            }
    
    async def get_transaction_status(self, transaction_id: int) -> Dict[str, Any]:
        """
        Holt Transaction Status
        
        Args:
            transaction_id: Transaction ID
            
        Returns:
            Dict mit Status
        """
        result = await self.db.execute(
            select(Transaction).where(Transaction.id == transaction_id)
        )
        transaction = result.scalar_one_or_none()
        
        if not transaction:
            raise ValueError(f"Transaction {transaction_id} nicht gefunden")
        
        return {
            "transaction_id": transaction.id,
            "status": transaction.status.value,
            "amount": transaction.amount,
            "payment_method": transaction.payment_method.value if transaction.payment_method else None,
            "completed_at": transaction.completed_at.isoformat() if transaction.completed_at else None,
            "balance_after": transaction.balance_after
        }
    
    # ==========================================
    # READER MANAGEMENT
    # ==========================================
    
    async def pair_reader(self, pairing_code: str, reader_name: str = "Vereinskasse Terminal") -> Dict[str, Any]:
        """
        Pairt SumUp Terminal mit Account
        
        Args:
            pairing_code: Pairing Code vom Terminal (8-stellig)
            reader_name: Name für Terminal
            
        Returns:
            Dict mit Reader-Informationen
        """
        payload = {
            "pairing_code": pairing_code,
            "name": reader_name
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.api_base_url}/merchants/{self.merchant_code}/readers",
                    json=payload,
                    headers=self.headers
                )
                response.raise_for_status()
                reader_data = response.json()
                
                # Reader ID in Settings speichern
                result = await self.db.execute(
                    select(SystemSettings).where(SystemSettings.id == 1)
                )
                sys_settings = result.scalar_one_or_none()
                
                if not sys_settings:
                    sys_settings = SystemSettings(id=1)
                    self.db.add(sys_settings)
                
                sys_settings.sumup_reader_id = reader_data.get("id")
                sys_settings.sumup_reader_name = reader_name
                await self.db.commit()
                
                return {
                    "reader_id": reader_data.get("id"),
                    "name": reader_name,
                    "status": "paired"
                }
                
            except Exception as e:
                raise Exception(f"Reader Pairing Failed: {str(e)}")
    
    async def get_reader_status(self, reader_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Prüft Terminal Status
        
        Args:
            reader_id: Optional Reader ID (sonst aus Settings)
            
        Returns:
            Dict mit Status
        """
        if reader_id is None:
            reader_id = await self.get_reader_id()
        
        if not reader_id:
            return {"status": "not_configured"}
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(
                    f"{self.api_base_url}/merchants/{self.merchant_code}/readers/{reader_id}",
                    headers=self.headers
                )
                response.raise_for_status()
                reader_data = response.json()
                
                return {
                    "reader_id": reader_id,
                    "name": reader_data.get("name"),
                    "online": reader_data.get("status") == "ONLINE",
                    "status": reader_data.get("status")
                }
                
            except Exception as e:
                return {
                    "reader_id": reader_id,
                    "online": False,
                    "error": str(e)
                }
    
    async def list_readers(self) -> list:
        """
        Listet alle gepairten Terminals
        
        Returns:
            List von Reader-Dicts
        """
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(
                    f"{self.api_base_url}/merchants/{self.merchant_code}/readers",
                    headers=self.headers
                )
                response.raise_for_status()
                return response.json()
                
            except Exception as e:
                raise Exception(f"List Readers Failed: {str(e)}")
