"""
URL Configuration for Authentication API

This module defines URL patterns for authentication endpoints.

Endpoints:
- POST /api/auth/register/ - Register new user
- POST /api/auth/login/ - Login with email/password
- POST /api/auth/logout/ - Logout (client-side token deletion)
- POST /api/auth/forgot-password/ - Request password reset
- POST /api/auth/reset-password/ - Reset password with token
- POST /api/auth/change-password/ - Change password (authenticated)
- GET  /api/auth/profile/ - Get current user profile

Related: BET-18 (Backend API Endpoints)
"""

from django.urls import path
from . import views

app_name = 'authentication'

urlpatterns = [
    # Registration & Login
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),

    # Email Verification
    path('verify-email/', views.verify_email, name='verify_email'),
    path('resend-verification/', views.resend_verification_email, name='resend_verification'),

    # Password Reset
    path('forgot-password/', views.forgot_password, name='forgot_password'),
    path('reset-password/', views.reset_password, name='reset_password'),
    path('change-password/', views.change_password, name='change_password'),

    # User Profile
    path('profile/', views.profile, name='profile'),
]
