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
from .models import User, PasswordResetToken


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
