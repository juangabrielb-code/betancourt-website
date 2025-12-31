"""
Email Service for Authentication

This module handles sending emails for authentication-related events:
- Password reset emails
- Email verification
- Welcome emails (future)

Uses Resend for email delivery.

Related: BET-29 (Email Service - Password Reset)
"""

import logging
import resend
from django.conf import settings
from decouple import config

# Configure logger
logger = logging.getLogger(__name__)

# Configure Resend API key
resend.api_key = config('RESEND_API_KEY', default='')

# Email sender configuration
FROM_EMAIL = config('RESEND_FROM_EMAIL', default='Betancourt Audio <noreply@betancourtaudio.com>')


def send_password_reset_email(user, token: str, retry_count: int = 3) -> bool:
    """
    Send password reset email using Resend.

    Args:
        user: User instance
        token (str): Password reset token
        retry_count (int): Number of retry attempts on failure

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    user_name = user.first_name or user.email

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #D4A574 0%, #C4956A 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Betancourt Audio</h1>
            </div>
            <div style="padding: 40px 30px;">
                <h2 style="color: #1a1a1a; margin-top: 0;">Restablecer Contraseña</h2>
                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                    Hola {user_name},
                </p>
                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                    Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente botón para crear una nueva:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_url}" style="background-color: #D4A574; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                        Restablecer Contraseña
                    </a>
                </div>
                <p style="color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                    Este enlace expira en {settings.PASSWORD_RESET_TOKEN_EXPIRY_HOURS} hora(s).
                </p>
                <p style="color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                    Si no solicitaste este cambio, puedes ignorar este email.
                </p>
            </div>
            <div style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                    © 2025 Betancourt Audio. Todos los derechos reservados.
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    for attempt in range(retry_count):
        try:
            params = {
                "from": FROM_EMAIL,
                "to": [user.email],
                "subject": "Restablecer Contraseña - Betancourt Audio",
                "html": html_content,
            }

            response = resend.Emails.send(params)

            logger.info(
                f'Password reset email sent successfully',
                extra={'email': user.email, 'user_id': str(user.id), 'resend_id': response.get('id')}
            )
            return True

        except Exception as e:
            logger.error(
                f'Failed to send password reset email (attempt {attempt + 1}/{retry_count})',
                extra={'email': user.email, 'error': str(e)},
                exc_info=True
            )

    return False


def send_email_verification(user, verification_token: str, retry_count: int = 3) -> bool:
    """
    Send email verification link using Resend.

    Args:
        user: User instance
        verification_token (str): Email verification token
        retry_count (int): Number of retry attempts on failure

    Returns:
        bool: True if email sent successfully
    """
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
    user_name = user.first_name or user.email

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #D4A574 0%, #C4956A 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Betancourt Audio</h1>
            </div>
            <div style="padding: 40px 30px;">
                <h2 style="color: #1a1a1a; margin-top: 0;">Verifica tu Email</h2>
                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                    Hola {user_name},
                </p>
                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                    Gracias por registrarte en Betancourt Audio. Por favor verifica tu email haciendo clic en el siguiente botón:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verify_url}" style="background-color: #D4A574; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                        Verificar Email
                    </a>
                </div>
                <p style="color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                    Este enlace expira en 24 horas.
                </p>
                <p style="color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                    Si no creaste esta cuenta, puedes ignorar este email.
                </p>
            </div>
            <div style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                    © 2025 Betancourt Audio. Todos los derechos reservados.
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    for attempt in range(retry_count):
        try:
            params = {
                "from": FROM_EMAIL,
                "to": [user.email],
                "subject": "Verifica tu Email - Betancourt Audio",
                "html": html_content,
            }

            response = resend.Emails.send(params)

            logger.info(
                f'Email verification sent successfully',
                extra={'email': user.email, 'user_id': str(user.id), 'resend_id': response.get('id')}
            )
            return True

        except Exception as e:
            logger.error(
                f'Failed to send email verification (attempt {attempt + 1}/{retry_count})',
                extra={'email': user.email, 'error': str(e)},
                exc_info=True
            )

    return False


def send_welcome_email(user) -> bool:
    """
    Send welcome email to new users (future implementation).
    """
    # TODO: Implement welcome email with Resend
    pass


def send_password_changed_notification(user) -> bool:
    """
    Send notification when password is changed using Resend.
    """
    user_name = user.first_name or user.email

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #D4A574 0%, #C4956A 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Betancourt Audio</h1>
            </div>
            <div style="padding: 40px 30px;">
                <h2 style="color: #1a1a1a; margin-top: 0;">Contraseña Actualizada</h2>
                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                    Hola {user_name},
                </p>
                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                    Tu contraseña ha sido actualizada exitosamente.
                </p>
                <p style="color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                    Si no realizaste este cambio, por favor contacta a nuestro equipo de soporte inmediatamente.
                </p>
            </div>
            <div style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                    © 2025 Betancourt Audio. Todos los derechos reservados.
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    try:
        params = {
            "from": FROM_EMAIL,
            "to": [user.email],
            "subject": "Tu Contraseña fue Actualizada - Betancourt Audio",
            "html": html_content,
        }

        response = resend.Emails.send(params)

        logger.info(
            f'Password changed notification sent',
            extra={'email': user.email, 'user_id': str(user.id), 'resend_id': response.get('id')}
        )
        return True

    except Exception as e:
        logger.error(
            f'Failed to send password changed notification',
            extra={'email': user.email, 'error': str(e)},
            exc_info=True
        )
        return False
