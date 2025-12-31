"""
Django Admin Configuration for Authentication Models

This module configures the Django admin interface for User and PasswordResetToken models.

Features:
- Custom UserAdmin with email-based authentication
- Search, filters, and ordering
- Read-only fields for sensitive data
- Password reset token management
- Security-focused display

Related: BET-17 (Database Models and Migrations)
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import User, PasswordResetToken, AuthUser, AuthAccount, AuthSession


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom User Admin for email-based authentication.

    Displays users with email as the primary identifier.
    Provides search, filters, and secure password management.
    """

    # List display configuration
    list_display = [
        'email',
        'get_full_name',
        'is_active',
        'is_staff',
        'email_verified',
        'date_joined'
    ]

    list_filter = [
        'is_active',
        'is_staff',
        'is_superuser',
        'email_verified',
        'date_joined',
    ]

    search_fields = [
        'email',
        'first_name',
        'last_name',
    ]

    ordering = ['-date_joined']

    # Fieldsets for add/edit forms
    fieldsets = (
        (None, {
            'fields': ('email', 'password')
        }),
        (_('Personal Info'), {
            'fields': ('first_name', 'last_name', 'phone_number')
        }),
        (_('Permissions'), {
            'fields': (
                'is_active',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions'
            ),
        }),
        (_('Email Verification'), {
            'fields': ('email_verified', 'email_verified_at'),
        }),
        (_('Important Dates'), {
            'fields': ('last_login', 'date_joined'),
        }),
    )

    # Fieldsets for add user form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email',
                'password1',
                'password2',
                'first_name',
                'last_name',
                'is_active',
                'is_staff',
                'is_superuser'
            ),
        }),
    )

    # Read-only fields
    readonly_fields = [
        'date_joined',
        'last_login',
        'email_verified_at',
    ]

    # Remove username from required fields (we use email instead)
    # This is inherited from BaseUserAdmin


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    """
    Admin interface for Password Reset Tokens.

    Provides read-only view of password reset tokens for auditing.
    Allows admins to see token usage and expiration.
    """

    list_display = [
        'user',
        'token_preview',
        'created_at',
        'expires_at',
        'is_used_display',
        'used_at',
    ]

    list_filter = [
        'is_used',
        'created_at',
        'expires_at',
    ]

    search_fields = [
        'user__email',
        'token',
    ]

    ordering = ['-created_at']

    # Make all fields read-only (tokens should not be edited)
    readonly_fields = [
        'id',
        'user',
        'token',
        'created_at',
        'expires_at',
        'is_used',
        'used_at',
    ]

    # Disable add/delete permissions (tokens are created programmatically)
    def has_add_permission(self, request):
        """Disable manual token creation via admin."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Allow deletion only of expired/used tokens."""
        if obj is None:
            return True
        return obj.is_used or not obj.is_valid()

    # Custom display methods
    def token_preview(self, obj):
        """Show truncated token for security."""
        return f"{obj.token[:8]}...{obj.token[-8:]}"
    token_preview.short_description = _('Token (preview)')

    def is_used_display(self, obj):
        """Display token used status with color."""
        if obj.is_used:
            return format_html(
                '<span style="color: #999;">✓ Used</span>'
            )
        elif not obj.is_valid():
            return format_html(
                '<span style="color: #ba2121;">✗ Expired</span>'
            )
        else:
            return format_html(
                '<span style="color: #417505;">✓ Valid</span>'
            )
    is_used_display.short_description = _('Status')

    # Fieldsets for detail view
    fieldsets = (
        (_('Token Information'), {
            'fields': ('id', 'token', 'user')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'expires_at')
        }),
        (_('Usage'), {
            'fields': ('is_used', 'used_at')
        }),
    )


# ==============================================================================
# OAuth Users Admin (Read-Only)
# ==============================================================================

@admin.register(AuthUser)
class AuthUserAdmin(admin.ModelAdmin):
    """
    Admin interface for OAuth Users (from Auth.js/NextAuth).
    Read-only access to users authenticated via Google, Facebook, etc.
    """

    list_display = [
        'email',
        'name',
        'role',
        'created_at',
        'image_preview',
    ]

    list_filter = [
        'role',
        'created_at',
    ]

    search_fields = [
        'email',
        'name',
    ]

    ordering = ['-created_at']

    readonly_fields = [
        'id',
        'name',
        'email',
        'email_verified',
        'image',
        'role',
        'created_at',
        'updated_at',
    ]

    def has_add_permission(self, request):
        """OAuth users are created via Auth.js, not Django admin."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Prevent deletion from Django admin."""
        return False

    def has_change_permission(self, request, obj=None):
        """Read-only access."""
        return False

    def image_preview(self, obj):
        """Show user avatar."""
        if obj.image:
            return format_html(
                '<img src="{}" width="30" height="30" style="border-radius: 50%;" />',
                obj.image
            )
        return "-"
    image_preview.short_description = _('Avatar')


@admin.register(AuthAccount)
class AuthAccountAdmin(admin.ModelAdmin):
    """
    Admin interface for OAuth Accounts (provider linkage).
    Shows which OAuth providers are linked to each user.
    """

    list_display = [
        'user',
        'provider',
        'type',
        'provider_account_id',
    ]

    list_filter = [
        'provider',
        'type',
    ]

    search_fields = [
        'user__email',
        'provider',
        'provider_account_id',
    ]

    readonly_fields = [
        'id',
        'user',
        'type',
        'provider',
        'provider_account_id',
        'refresh_token',
        'access_token',
        'expires_at',
        'token_type',
        'scope',
        'id_token',
        'session_state',
    ]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(AuthSession)
class AuthSessionAdmin(admin.ModelAdmin):
    """
    Admin interface for OAuth Sessions.
    Shows active sessions for OAuth users.
    """

    list_display = [
        'user',
        'session_token_preview',
        'expires',
    ]

    list_filter = [
        'expires',
    ]

    search_fields = [
        'user__email',
    ]

    ordering = ['-expires']

    readonly_fields = [
        'id',
        'session_token',
        'user',
        'expires',
    ]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def session_token_preview(self, obj):
        """Show truncated session token."""
        return f"{obj.session_token[:12]}..."
    session_token_preview.short_description = _('Session Token')
