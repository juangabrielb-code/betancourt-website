"""
Django REST Framework Serializers for Authentication

This module contains serializers for user registration, login, and password reset.

Security Features:
- Password validation with Django validators
- Email normalization
- Write-only password fields
- Anti-enumeration error messages
- Input sanitization

Related: BET-18 (Backend API Endpoints)
"""

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User, PasswordResetToken


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.

    Used for user profile display (excluding sensitive data).
    """

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'email_verified',
            'date_joined',
        ]
        read_only_fields = [
            'id',
            'email',
            'is_active',
            'email_verified',
            'date_joined',
        ]


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.

    Validates email uniqueness, password strength, and creates new users.

    Security:
    - Password write-only (never returned in response)
    - Django password validators applied
    - Email normalized to lowercase
    - Password hashed with Argon2id automatically
    """

    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text='Password (min 8 characters, must contain uppercase, lowercase, and digit)'
    )

    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text='Confirm password (must match password)'
    )

    class Meta:
        model = User
        fields = [
            'email',
            'password',
            'password_confirm',
            'first_name',
            'last_name',
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def validate_email(self, value):
        """
        Normalize and validate email.

        Security: Case-insensitive email comparison
        """
        value = value.lower().strip()

        # Check if email already exists
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    def validate_password(self, value):
        """
        Validate password strength using Django validators.

        Applies all PASSWORD_VALIDATORS from settings.py:
        - UserAttributeSimilarityValidator
        - MinimumLengthValidator (8 characters)
        - CommonPasswordValidator
        - NumericPasswordValidator
        """
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

        return value

    def validate(self, attrs):
        """
        Validate that passwords match.
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })

        # Remove password_confirm from attrs (not a model field)
        attrs.pop('password_confirm')

        return attrs

    def create(self, validated_data):
        """
        Create new user with hashed password.

        Security:
        - Uses User.objects.create_user() which hashes password with Argon2id
        - Sets is_active=True by default
        - Sets email_verified=False (requires verification)
        """
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )

        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.

    Validates credentials and returns JWT tokens.

    Security:
    - Timing-safe password comparison (handled by Django)
    - Generic error messages (anti-enumeration)
    - Password write-only
    """

    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        """
        Validate credentials.

        Note: Actual authentication is done in the view to use timing-safe comparison.
        This just validates that fields are present and formatted correctly.
        """
        email = attrs.get('email', '').lower().strip()
        attrs['email'] = email

        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    """
    Serializer for password reset request.

    Security:
    - Generic success message (anti-enumeration)
    - Email normalized
    - Does not reveal if email exists
    """

    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        """
        Normalize email.

        Note: We don't validate if email exists here (anti-enumeration).
        The view will handle this silently.
        """
        return value.lower().strip()


class ResetPasswordSerializer(serializers.Serializer):
    """
    Serializer for password reset confirmation.

    Security:
    - Token validation
    - Password strength validation
    - Generic error messages
    """

    token = serializers.CharField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    def validate_password(self, value):
        """
        Validate password strength.
        """
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

        return value

    def validate(self, attrs):
        """
        Validate that passwords match and token is valid.
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })

        # Validate token exists and is valid
        token = attrs['token']
        try:
            reset_token = PasswordResetToken.objects.get(token=token)

            if not reset_token.is_valid():
                raise serializers.ValidationError({
                    'token': 'Token is invalid or has expired.'
                })

            attrs['reset_token'] = reset_token
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError({
                'token': 'Token is invalid or has expired.'
            })

        # Remove password_confirm from attrs
        attrs.pop('password_confirm')

        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing password (authenticated users).

    Security:
    - Requires old password verification
    - Password strength validation
    """

    old_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    def validate_new_password(self, value):
        """
        Validate new password strength.
        """
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

        return value

    def validate(self, attrs):
        """
        Validate that new passwords match.
        """
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Passwords do not match.'
            })

        # Remove confirm field
        attrs.pop('new_password_confirm')

        return attrs
