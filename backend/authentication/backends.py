"""
Custom Authentication Backend for Email-Based Login

This module provides a custom authentication backend that uses email
instead of username for user authentication.

Related: BET-18 (Backend API Endpoints)
"""

from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()


class EmailBackend(ModelBackend):
    """
    Custom authentication backend that uses email instead of username.

    This allows users to authenticate with their email address.

    Usage:
        # In settings.py
        AUTHENTICATION_BACKENDS = [
            'authentication.backends.EmailBackend',
        ]

        # In views
        user = authenticate(request, email='user@example.com', password='pass')
    """

    def authenticate(self, request, email=None, password=None, **kwargs):
        """
        Authenticate a user with email and password.

        Args:
            request: HTTP request object
            email (str): User's email address
            password (str): User's password (plain text)
            **kwargs: Additional keyword arguments

        Returns:
            User: Authenticated user instance or None

        Security:
        - Uses timing-safe password comparison (check_password)
        - Email lookup is case-insensitive
        - Returns None for invalid credentials (no error details)
        """
        if email is None or password is None:
            return None

        try:
            # Case-insensitive email lookup
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # User not found - run password hasher to prevent timing attacks
            User().set_password(password)
            return None

        # Check password (timing-safe comparison)
        if user.check_password(password):
            return user

        return None

    def get_user(self, user_id):
        """
        Get a user by ID.

        Args:
            user_id: User's primary key (UUID)

        Returns:
            User: User instance or None
        """
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
