"""
Email Service for sending emails via SMTP
"""
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os
from app.core.config import settings


class EmailService:
    """Service for sending emails"""
    
    @staticmethod
    def send_email(
        to_email: str,
        subject: str,
        body_text: str,
        body_html: Optional[str] = None
    ) -> bool:
        """
        Send email via SMTP
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body_text: Plain text body
            body_html: Optional HTML body
            
        Returns:
            bool: True if sent successfully
        """
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM}>"
            message["To"] = to_email
            
            # Add plain text
            part1 = MIMEText(body_text, "plain")
            message.attach(part1)
            
            # Add HTML if provided
            if body_html:
                part2 = MIMEText(body_html, "html")
                message.attach(part2)
            
            # Create SSL context
            context = ssl.create_default_context()
            
            # Send email
            with smtplib.SMTP_SSL(
                settings.SMTP_HOST,
                settings.SMTP_PORT,
                context=context
            ) as server:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(
                    settings.SMTP_FROM,
                    to_email,
                    message.as_string()
                )
            
            return True
            
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
    
    @staticmethod
    def send_password_reset_email(email: str, code: str, first_name: str) -> bool:
        """
        Send password reset code email
        
        Args:
            email: User email
            code: 6-digit reset code
            first_name: User's first name
            
        Returns:
            bool: True if sent successfully
        """
        subject = "Passwort zurücksetzen - Vereinskasse"
        
        body_text = f"""
Hallo {first_name},

Du hast einen Code zum Zurücksetzen deines Passworts angefordert.

Dein Code: {code}

Dieser Code ist 1 Stunde gültig.

Falls du diese Anfrage nicht gestellt hast, ignoriere diese Email.

Viele Grüße,
Dein Vereinskassen-Team
        """
        
        body_html = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Passwort zurücksetzen</h2>
        <p>Hallo {first_name},</p>
        <p>Du hast einen Code zum Zurücksetzen deines Passworts angefordert.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Dein Code:</p>
            <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px;">
                {code}
            </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">Dieser Code ist 1 Stunde gültig.</p>
        <p style="color: #6b7280; font-size: 14px;">
            Falls du diese Anfrage nicht gestellt hast, ignoriere diese Email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #9ca3af; font-size: 12px;">Viele Grüße,<br>Dein Vereinskassen-Team</p>
    </div>
</body>
</html>
        """
        
        return EmailService.send_email(email, subject, body_text, body_html)
