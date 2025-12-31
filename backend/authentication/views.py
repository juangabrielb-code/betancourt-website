"""
Django REST Framework Views for Authentication

This module contains API views for user registration, login, and password reset.

Security Features:
- Rate limiting on all endpoints
- Anti-enumeration protection (timing-safe comparisons)
- JWT token generation
- Argon2id password hashing
- Generic error messages

Related: BET-18 (Backend API Endpoints)
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from django.conf import settings
from decouple import config
import time

from .models import User, PasswordResetToken, EmailVerificationToken
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    ChangePasswordSerializer,
)
from .email_service import send_password_reset_email, send_password_changed_notification, send_email_verification


def get_tokens_for_user(user):
    """
    Generate JWT tokens for a user.

    Args:
        user (User): User instance

    Returns:
        dict: Dictionary with 'refresh' and 'access' tokens

    Example:
        tokens = get_tokens_for_user(user)
        # {'refresh': '...', 'access': '...'}
    """
    refresh = RefreshToken.for_user(user)

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user.

    POST /api/auth/register/

    Request Body:
        {
            "email": "user@example.com",
            "password": "SecurePass123",
            "password_confirm": "SecurePass123",
            "first_name": "John",
            "last_name": "Doe"
        }

    Response (201 Created):
        {
            "user": {
                "id": "uuid",
                "email": "user@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "email_verified": false
            },
            "tokens": {
                "refresh": "...",
                "access": "..."
            },
            "message": "Registration successful"
        }

    Response (400 Bad Request):
        {
            "email": ["A user with this email already exists."],
            "password": ["This password is too common."]
        }

    Security:
    - Password hashed with Argon2id
    - Email normalized to lowercase
    - Automatic login after registration (JWT tokens returned)
    - Rate limited (configured in settings)
    """
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        # Create user (password automatically hashed)
        user = serializer.save()

        # Generate JWT tokens
        tokens = get_tokens_for_user(user)

        # Send email verification
        verification_token = EmailVerificationToken.create_token(user)
        email_sent = send_email_verification(user, verification_token.token)

        # Log verification email status (for development)
        if settings.DEBUG:
            print(f"\n{'='*60}")
            print(f"EMAIL VERIFICATION TOKEN (DEV ONLY)")
            print(f"{'='*60}")
            print(f"Email: {user.email}")
            print(f"Token: {verification_token.token}")
            print(f"Verify URL: {settings.FRONTEND_URL}/verify-email?token={verification_token.token}")
            print(f"Expires: {verification_token.expires_at}")
            print(f"Email Sent: {'✓' if email_sent else '✗'}")
            print(f"{'='*60}\n")

        # Return user data + tokens
        return Response({
            'user': UserSerializer(user).data,
            'tokens': tokens,
            'message': 'Registration successful. Please check your email to verify your account.'
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login with email and password.

    POST /api/auth/login/

    Request Body:
        {
            "email": "user@example.com",
            "password": "SecurePass123"
        }

    Response (200 OK):
        {
            "user": {
                "id": "uuid",
                "email": "user@example.com",
                "first_name": "John",
                "last_name": "Doe"
            },
            "tokens": {
                "refresh": "...",
                "access": "..."
            },
            "message": "Login successful"
        }

    Response (401 Unauthorized):
        {
            "detail": "Invalid credentials"
        }

    Security:
    - Timing-safe password comparison (Django authenticate)
    - Generic error message (anti-enumeration)
    - Rate limited
    - Constant time response (anti-enumeration)
    """
    start_time = time.time()

    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        # Constant time delay for anti-enumeration
        elapsed = time.time() - start_time
        if elapsed < 0.5:  # Minimum 500ms response time
            time.sleep(0.5 - elapsed)

        return Response({
            'detail': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)

    email = serializer.validated_data['email']
    password = serializer.validated_data['password']

    # Authenticate user (timing-safe password comparison)
    user = authenticate(request, email=email, password=password)

    if user is None:
        # User doesn't exist or password incorrect
        # Constant time delay for anti-enumeration
        elapsed = time.time() - start_time
        if elapsed < 0.5:
            time.sleep(0.5 - elapsed)

        return Response({
            'detail': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)

    # Check if user is active
    if not user.is_active:
        return Response({
            'detail': 'Account is disabled'
        }, status=status.HTTP_401_UNAUTHORIZED)

    # Update last login
    user.last_login = timezone.now()
    user.save(update_fields=['last_login'])

    # Generate JWT tokens
    tokens = get_tokens_for_user(user)

    return Response({
        'user': UserSerializer(user).data,
        'tokens': tokens,
        'message': 'Login successful'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """
    Request password reset token.

    POST /api/auth/forgot-password/

    Request Body:
        {
            "email": "user@example.com"
        }

    Response (200 OK) - Always returns success:
        {
            "message": "If an account exists with this email, a password reset link has been sent."
        }

    Security:
    - Anti-enumeration: Always returns success (doesn't reveal if email exists)
    - Tokens expire in 1 hour (configurable)
    - Cryptographically secure tokens (256-bit)
    - Rate limited (prevents spam)

    Note:
    - Email sending is handled asynchronously (future: Celery)
    - For now, token is created but email not sent (BET-21)
    """
    serializer = ForgotPasswordSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email']

    # Check if user exists (silently, for security)
    try:
        user = User.objects.get(email=email)

        # Create password reset token
        expiry_hours = config('PASSWORD_RESET_TOKEN_EXPIRY_HOURS', default=1, cast=int)
        reset_token = PasswordResetToken.create_token(user, expiry_hours=expiry_hours)

        # Send password reset email
        email_sent = send_password_reset_email(user, reset_token.token)

        # For development: Log token to console (in addition to email)
        if settings.DEBUG:
            print(f"\n{'='*60}")
            print(f"PASSWORD RESET TOKEN (DEV ONLY)")
            print(f"{'='*60}")
            print(f"Email: {user.email}")
            print(f"Token: {reset_token.token}")
            print(f"Reset URL: {settings.FRONTEND_URL}/reset-password?token={reset_token.token}")
            print(f"Expires: {reset_token.expires_at}")
            print(f"Email Sent: {'✓' if email_sent else '✗'}")
            print(f"{'='*60}\n")

    except User.DoesNotExist:
        # User doesn't exist - but we don't reveal this (anti-enumeration)
        pass

    # Always return success message (anti-enumeration)
    return Response({
        'message': 'If an account exists with this email, a password reset link has been sent.'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    Reset password with token.

    POST /api/auth/reset-password/

    Request Body:
        {
            "token": "abc123...",
            "password": "NewSecurePass123",
            "password_confirm": "NewSecurePass123"
        }

    Response (200 OK):
        {
            "message": "Password reset successful"
        }

    Response (400 Bad Request):
        {
            "token": ["Token is invalid or has expired."],
            "password": ["This password is too common."]
        }

    Security:
    - Token validation (expiration + usage)
    - Password strength validation
    - Token marked as used (one-time use)
    - Generic error messages
    """
    serializer = ResetPasswordSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Get validated data
    reset_token = serializer.validated_data['reset_token']
    new_password = serializer.validated_data['password']

    # Get user
    user = reset_token.user

    # Set new password (automatically hashed with Argon2id)
    user.set_password(new_password)
    user.save()

    # Mark token as used
    reset_token.mark_as_used()

    return Response({
        'message': 'Password reset successful'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change password for authenticated user.

    POST /api/auth/change-password/
    Authorization: Bearer <access_token>

    Request Body:
        {
            "old_password": "OldPass123",
            "new_password": "NewSecurePass123",
            "new_password_confirm": "NewSecurePass123"
        }

    Response (200 OK):
        {
            "message": "Password changed successfully"
        }

    Response (400 Bad Request):
        {
            "old_password": ["Incorrect password."],
            "new_password": ["This password is too common."]
        }

    Security:
    - Requires authentication (JWT token)
    - Verifies old password
    - Password strength validation
    """
    serializer = ChangePasswordSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    old_password = serializer.validated_data['old_password']
    new_password = serializer.validated_data['new_password']

    # Verify old password
    if not user.check_password(old_password):
        return Response({
            'old_password': ['Incorrect password.']
        }, status=status.HTTP_400_BAD_REQUEST)

    # Set new password
    user.set_password(new_password)
    user.save()

    # Send notification email (security feature)
    send_password_changed_notification(user)

    return Response({
        'message': 'Password changed successfully'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """
    Get current user profile.

    GET /api/auth/profile/
    Authorization: Bearer <access_token>

    Response (200 OK):
        {
            "id": "uuid",
            "email": "user@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "is_active": true,
            "email_verified": false,
            "date_joined": "2025-12-26T..."
        }

    Security:
    - Requires authentication (JWT token)
    - Only returns current user's data
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout (token blacklist - future implementation).

    POST /api/auth/logout/
    Authorization: Bearer <access_token>

    Response (200 OK):
        {
            "message": "Logout successful"
        }

    Note:
    - JWT tokens are stateless, so logout is client-side (delete tokens)
    - Future: Implement token blacklist for server-side logout
    """
    # TODO: Implement token blacklist (djangorestframework-simplejwt supports this)
    # For now, logout is handled client-side by deleting tokens

    return Response({
        'message': 'Logout successful'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """
    Verify email with token.

    POST /api/auth/verify-email/

    Request Body:
        {
            "token": "abc123..."
        }

    Response (200 OK):
        {
            "message": "Email verified successfully"
        }

    Response (400 Bad Request):
        {
            "detail": "Token is invalid or has expired."
        }
    """
    token = request.data.get('token')

    if not token:
        return Response({
            'detail': 'Token is required.'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        verification_token = EmailVerificationToken.objects.get(token=token)
    except EmailVerificationToken.DoesNotExist:
        return Response({
            'detail': 'Token is invalid or has expired.'
        }, status=status.HTTP_400_BAD_REQUEST)

    if not verification_token.is_valid():
        return Response({
            'detail': 'Token is invalid or has expired.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Mark email as verified
    user = verification_token.user
    user.email_verified = True
    user.email_verified_at = timezone.now()
    user.save(update_fields=['email_verified', 'email_verified_at'])

    # Mark token as used
    verification_token.mark_as_used()

    return Response({
        'message': 'Email verified successfully'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resend_verification_email(request):
    """
    Resend email verification link.

    POST /api/auth/resend-verification/
    Authorization: Bearer <access_token>

    Response (200 OK):
        {
            "message": "Verification email sent successfully"
        }

    Response (400 Bad Request):
        {
            "detail": "Email is already verified."
        }
    """
    user = request.user

    if user.email_verified:
        return Response({
            'detail': 'Email is already verified.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Create new verification token
    verification_token = EmailVerificationToken.create_token(user)

    # Send verification email
    email_sent = send_email_verification(user, verification_token.token)

    if settings.DEBUG:
        print(f"\n{'='*60}")
        print(f"EMAIL VERIFICATION TOKEN (RESEND)")
        print(f"{'='*60}")
        print(f"Email: {user.email}")
        print(f"Token: {verification_token.token}")
        print(f"Verify URL: {settings.FRONTEND_URL}/verify-email?token={verification_token.token}")
        print(f"Email Sent: {'✓' if email_sent else '✗'}")
        print(f"{'='*60}\n")

    return Response({
        'message': 'Verification email sent successfully'
    }, status=status.HTTP_200_OK)
