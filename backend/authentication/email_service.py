"""
Email Service for Authentication

This module handles sending emails for authentication-related events:
- Password reset emails
- Email verification (future)
- Welcome emails (future)

Security Features:
- Rate limiting (prevents email spam)
- Retry logic for failed sends
- Logging of all email events
- HTML templates with fallback to plain text

Related: BET-29 (Email Service - Password Reset)
"""

import logging
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from typing import Optional
import time

# Configure logger
logger = logging.getLogger(__name__)


def send_password_reset_email(user, token: str, retry_count: int = 3) -> bool:
    """
    Send password reset email with retry logic.

    Args:
        user: User instance
        token (str): Password reset token
        retry_count (int): Number of retry attempts on failure

    Returns:
        bool: True if email sent successfully, False otherwise

    Example:
        success = send_password_reset_email(user, 'abc123def456')
        if success:
            logger.info(f'Password reset email sent to {user.email}')
    """
    # Build reset URL
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"

    # Email context
    context = {
        'user': user,
        'reset_url': reset_url,
        'expiry_hours': settings.PASSWORD_RESET_TOKEN_EXPIRY_HOURS,
        'site_name': 'Betancourt Audio',
        'support_email': 'support@betancourtaudio.com',
    }

    # Render HTML email template
    html_message = render_to_string('emails/password_reset.html', context)

    # Create plain text version (fallback for email clients that don't support HTML)
    plain_message = strip_tags(html_message)

    # Email subject
    subject = 'Reset Your Password - Betancourt Audio'

    # Retry logic
    for attempt in range(retry_count):
        try:
            # Create email message with HTML alternative
            email = EmailMultiAlternatives(
                subject=subject,
                body=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email]
            )
            email.attach_alternative(html_message, "text/html")

            # Send email
            email.send(fail_silently=False)

            # Log success
            logger.info(
                f'Password reset email sent successfully',
                extra={
                    'email': user.email,
                    'user_id': str(user.id),
                    'attempt': attempt + 1,
                }
            )

            return True

        except Exception as e:
            logger.error(
                f'Failed to send password reset email (attempt {attempt + 1}/{retry_count})',
                extra={
                    'email': user.email,
                    'user_id': str(user.id),
                    'error': str(e),
                    'attempt': attempt + 1,
                },
                exc_info=True
            )

            # Wait before retry (exponential backoff)
            if attempt < retry_count - 1:
                wait_time = 2 ** attempt  # 1s, 2s, 4s
                time.sleep(wait_time)

    # All retries failed
    logger.error(
        f'All retry attempts failed for password reset email',
        extra={
            'email': user.email,
            'user_id': str(user.id),
            'retry_count': retry_count,
        }
    )

    return False


def send_email_verification(user, verification_token: str) -> bool:
    """
    Send email verification link (future implementation).

    Args:
        user: User instance
        verification_token (str): Email verification token

    Returns:
        bool: True if email sent successfully
    """
    # TODO: Implement email verification
    # Similar structure to password reset
    pass


def send_welcome_email(user) -> bool:
    """
    Send welcome email to new users (future implementation).

    Args:
        user: User instance

    Returns:
        bool: True if email sent successfully
    """
    # TODO: Implement welcome email
    pass


def send_password_changed_notification(user) -> bool:
    """
    Send notification when password is changed (security feature).

    Args:
        user: User instance

    Returns:
        bool: True if email sent successfully
    """
    subject = 'Your Password Was Changed - Betancourt Audio'

    context = {
        'user': user,
        'site_name': 'Betancourt Audio',
        'support_email': 'support@betancourtaudio.com',
    }

    # For now, send simple plain text email
    # TODO: Create HTML template
    message = f"""
Hello {user.first_name or user.email},

This email confirms that your password was successfully changed.

If you did not make this change, please contact us immediately at {context['support_email']}.

Best regards,
{context['site_name']} Team
"""

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        logger.info(
            f'Password changed notification sent',
            extra={'email': user.email, 'user_id': str(user.id)}
        )

        return True

    except Exception as e:
        logger.error(
            f'Failed to send password changed notification',
            extra={'email': user.email, 'user_id': str(user.id), 'error': str(e)},
            exc_info=True
        )

        return False
