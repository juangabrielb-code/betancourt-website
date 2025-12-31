"""
Authentication Models

This module contains the custom User model and related authentication models
for the Betancourt Website authentication system.

Security Features:
- UUID primary keys (prevents enumeration)
- Email as unique identifier (USERNAME_FIELD)
- Password hashing with Argon2id (configured in settings.py)
- Secure password reset tokens with expiration

Related: BET-17 (Database Models and Migrations)
"""

import uuid
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from datetime import timedelta
import secrets


class CustomUserManager(BaseUserManager):
    """
    Custom user manager that uses email as the unique identifier
    instead of username.
    """

    def create_user(self, email, password=None, **extra_fields):
        """
        Create and save a regular user with the given email and password.

        Args:
            email (str): User's email address
            password (str): User's password (will be hashed)
            **extra_fields: Additional fields for the user model

        Returns:
            User: Created user instance

        Raises:
            ValueError: If email is not provided
        """
        if not email:
            raise ValueError(_('The Email field must be set'))

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # Hashes password with Argon2id
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and save a superuser with the given email and password.

        Args:
            email (str): Superuser's email address
            password (str): Superuser's password
            **extra_fields: Additional fields for the user model

        Returns:
            User: Created superuser instance
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom User Model for Betancourt Website.

    Uses email as the unique identifier instead of username.
    UUID is used as the primary key for security (prevents enumeration).

    Fields:
        id (UUID): Primary key (auto-generated UUID4)
        email (EmailField): Unique email address (USERNAME_FIELD)
        first_name (CharField): User's first name
        last_name (CharField): User's last name
        is_active (BooleanField): Account activation status
        is_staff (BooleanField): Staff access to admin
        is_superuser (BooleanField): Full admin permissions
        date_joined (DateTimeField): Account creation timestamp
        last_login (DateTimeField): Last login timestamp

    Security:
        - Passwords hashed with Argon2id (configured in settings.py)
        - Email used as USERNAME_FIELD (no username field)
        - UUID primary key prevents user enumeration
        - email field has db_index for fast lookups

    Related: BET-17 (Database Models)
    """

    # UUID Primary Key (Security: prevents enumeration attacks)
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text=_('Unique identifier for the user')
    )

    # Email as unique identifier (replaces username)
    email = models.EmailField(
        _('email address'),
        unique=True,
        db_index=True,  # Index for fast lookups
        help_text=_('Email address used for login')
    )

    # Remove username field (inherited from AbstractUser)
    username = None

    # Optional: Add phone number for future 2FA
    phone_number = models.CharField(
        _('phone number'),
        max_length=20,
        blank=True,
        null=True,
        help_text=_('Phone number for 2FA (optional)')
    )

    # Email verification status
    email_verified = models.BooleanField(
        _('email verified'),
        default=False,
        help_text=_('Whether the user has verified their email address')
    )

    # Timestamp for email verification
    email_verified_at = models.DateTimeField(
        _('email verified at'),
        null=True,
        blank=True,
        help_text=_('Timestamp when email was verified')
    )

    # User manager
    objects = CustomUserManager()

    # Configure email as the USERNAME_FIELD
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # Email is already required as USERNAME_FIELD

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        db_table = 'auth_user'
        indexes = [
            models.Index(fields=['email'], name='user_email_idx'),
            models.Index(fields=['is_active'], name='user_active_idx'),
        ]

    def __str__(self):
        """String representation of the user."""
        return self.email

    def get_full_name(self):
        """
        Return the first_name plus the last_name, with a space in between.

        Returns:
            str: Full name or email if names not set
        """
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.email

    def get_short_name(self):
        """
        Return the short name for the user.

        Returns:
            str: First name or email if not set
        """
        return self.first_name if self.first_name else self.email


class PasswordResetToken(models.Model):
    """
    Password Reset Token Model.

    Stores secure tokens for password reset functionality.
    Tokens expire after a configurable time period (default: 1 hour).

    Fields:
        id (UUID): Primary key
        user (ForeignKey): Related user
        token (CharField): Cryptographically secure token
        created_at (DateTimeField): Token creation timestamp
        expires_at (DateTimeField): Token expiration timestamp
        is_used (BooleanField): Whether token has been used
        used_at (DateTimeField): Timestamp when token was used

    Security:
        - Tokens are cryptographically secure (32 bytes = 256 bits)
        - Tokens expire after configured time (default: 1 hour)
        - Tokens can only be used once (is_used flag)
        - Unique constraint prevents duplicate tokens
        - Related user deletion cascades to tokens

    Related: BET-17 (Database Models), BET-21 (Email Service)
    """

    # UUID Primary Key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    # Related user
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='password_reset_tokens',
        help_text=_('User requesting password reset')
    )

    # Cryptographically secure token
    token = models.CharField(
        _('token'),
        max_length=64,
        unique=True,
        db_index=True,
        help_text=_('Secure token for password reset')
    )

    # Timestamps
    created_at = models.DateTimeField(
        _('created at'),
        auto_now_add=True,
        help_text=_('When the token was created')
    )

    expires_at = models.DateTimeField(
        _('expires at'),
        help_text=_('When the token expires')
    )

    # Usage tracking
    is_used = models.BooleanField(
        _('is used'),
        default=False,
        db_index=True,
        help_text=_('Whether the token has been used')
    )

    used_at = models.DateTimeField(
        _('used at'),
        null=True,
        blank=True,
        help_text=_('When the token was used')
    )

    class Meta:
        verbose_name = _('password reset token')
        verbose_name_plural = _('password reset tokens')
        db_table = 'auth_password_reset_token'
        indexes = [
            models.Index(fields=['token'], name='reset_token_idx'),
            models.Index(fields=['user', 'is_used'], name='reset_user_used_idx'),
            models.Index(fields=['expires_at'], name='reset_expires_idx'),
        ]
        ordering = ['-created_at']

    def __str__(self):
        """String representation of the token."""
        return f"Reset token for {self.user.email} ({'used' if self.is_used else 'active'})"

    @classmethod
    def create_token(cls, user, expiry_hours=1):
        """
        Create a new password reset token for the given user.

        Args:
            user (User): User requesting password reset
            expiry_hours (int): Hours until token expires (default: 1)

        Returns:
            PasswordResetToken: Created token instance
        """
        # Generate cryptographically secure token
        token = secrets.token_urlsafe(32)  # 32 bytes = 256 bits

        # Calculate expiration time
        expires_at = timezone.now() + timedelta(hours=expiry_hours)

        # Create and return token
        return cls.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )

    def is_valid(self):
        """
        Check if the token is valid (not used and not expired).

        Returns:
            bool: True if token is valid, False otherwise
        """
        if self.is_used:
            return False

        if timezone.now() > self.expires_at:
            return False

        return True

    def mark_as_used(self):
        """
        Mark the token as used and record the timestamp.
        """
        self.is_used = True
        self.used_at = timezone.now()
        self.save(update_fields=['is_used', 'used_at'])

    @classmethod
    def cleanup_expired_tokens(cls):
        """
        Delete all expired and used tokens.
        Should be run periodically as a cleanup task.

        Returns:
            int: Number of tokens deleted
        """
        expired = cls.objects.filter(expires_at__lt=timezone.now())
        used = cls.objects.filter(is_used=True)
        count = expired.count() + used.count()
        expired.delete()
        used.delete()
        return count


class EmailVerificationToken(models.Model):
    """
    Email Verification Token Model.

    Stores secure tokens for email verification functionality.
    Tokens expire after a configurable time period (default: 24 hours).
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='email_verification_tokens',
        help_text=_('User requesting email verification')
    )

    token = models.CharField(
        _('token'),
        max_length=64,
        unique=True,
        db_index=True,
        help_text=_('Secure token for email verification')
    )

    created_at = models.DateTimeField(
        _('created at'),
        auto_now_add=True
    )

    expires_at = models.DateTimeField(
        _('expires at'),
        help_text=_('When the token expires')
    )

    is_used = models.BooleanField(
        _('is used'),
        default=False,
        db_index=True
    )

    used_at = models.DateTimeField(
        _('used at'),
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = _('email verification token')
        verbose_name_plural = _('email verification tokens')
        db_table = 'auth_email_verification_token'
        ordering = ['-created_at']

    def __str__(self):
        return f"Verification token for {self.user.email}"

    @classmethod
    def create_token(cls, user, expiry_hours=24):
        """Create a new email verification token."""
        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(hours=expiry_hours)

        return cls.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )

    def is_valid(self):
        """Check if the token is valid."""
        if self.is_used:
            return False
        if timezone.now() > self.expires_at:
            return False
        return True

    def mark_as_used(self):
        """Mark the token as used."""
        self.is_used = True
        self.used_at = timezone.now()
        self.save(update_fields=['is_used', 'used_at'])


# ==============================================================================
# OAuth Authentication Models (Read-Only)
# ==============================================================================
# These models provide Django access to Auth.js/Prisma OAuth user data.
# They use managed=False to prevent Django from managing these tables.
# Tables are created and managed by Prisma/Auth.js.
# Related: BET-5 (Social Authentication)
# ==============================================================================

class AuthUser(models.Model):
    """
    Read-only model to access Next-Auth users table.
    This model uses managed=False to prevent Django from managing the table.
    The table is created and managed by Prisma/Auth.js.

    This allows Django to query OAuth user data alongside traditional email/password users.
    """
    id = models.CharField(max_length=255, primary_key=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(unique=True)
    email_verified = models.DateTimeField(null=True, blank=True, db_column='emailVerified')
    image = models.URLField(null=True, blank=True)
    role = models.CharField(max_length=50, default='CLIENT')
    created_at = models.DateTimeField(auto_now_add=True, db_column='createdAt')
    updated_at = models.DateTimeField(auto_now=True, db_column='updatedAt')

    class Meta:
        managed = False
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return self.email


class AuthAccount(models.Model):
    """
    Read-only model to access Next-Auth accounts table.
    Links OAuth users to their providers (Google, Facebook, Apple, Microsoft).
    """
    id = models.CharField(max_length=255, primary_key=True)
    user = models.ForeignKey(AuthUser, on_delete=models.DO_NOTHING, db_column='userId', related_name='accounts')
    type = models.CharField(max_length=255)
    provider = models.CharField(max_length=255)
    provider_account_id = models.CharField(max_length=255, db_column='providerAccountId')
    refresh_token = models.TextField(null=True, blank=True)
    access_token = models.TextField(null=True, blank=True)
    expires_at = models.BigIntegerField(null=True, blank=True)
    token_type = models.CharField(max_length=255, null=True, blank=True)
    scope = models.TextField(null=True, blank=True)
    id_token = models.TextField(null=True, blank=True)
    session_state = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'accounts'
        unique_together = [['provider', 'provider_account_id']]

    def __str__(self):
        return f"{self.user.email} - {self.provider}"


class AuthSession(models.Model):
    """
    Read-only model to access Next-Auth sessions table.
    Stores active OAuth user sessions.
    """
    id = models.CharField(max_length=255, primary_key=True)
    session_token = models.CharField(max_length=255, unique=True, db_column='sessionToken')
    user = models.ForeignKey(AuthUser, on_delete=models.DO_NOTHING, db_column='userId', related_name='sessions')
    expires = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'sessions'

    def __str__(self):
        return f"{self.user.email} - {self.session_token[:20]}..."


class VerificationToken(models.Model):
    """
    Read-only model to access Next-Auth verification_tokens table.
    Used for email verification flows in OAuth.
    """
    identifier = models.CharField(max_length=255)
    token = models.CharField(max_length=255, unique=True)
    expires = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'verification_tokens'
        unique_together = [['identifier', 'token']]

    def __str__(self):
        return f"{self.identifier} - {self.token[:20]}..."
