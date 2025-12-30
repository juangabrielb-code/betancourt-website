from django.contrib import admin
from .models import AuthUser, AuthAccount, AuthSession, VerificationToken


@admin.register(AuthUser)
class AuthUserAdmin(admin.ModelAdmin):
    """Admin interface for AuthUser (read-only)"""
    list_display = ['email', 'name', 'role', 'email_verified', 'created_at']
    list_filter = ['role', 'email_verified', 'created_at']
    search_fields = ['email', 'name']
    readonly_fields = [
        'id', 'name', 'email', 'email_verified',
        'image', 'role', 'created_at', 'updated_at'
    ]
    ordering = ['-created_at']

    def has_add_permission(self, request):
        # Read-only model
        return False

    def has_delete_permission(self, request, obj=None):
        # Read-only model
        return False


@admin.register(AuthAccount)
class AuthAccountAdmin(admin.ModelAdmin):
    """Admin interface for AuthAccount (read-only)"""
    list_display = ['user', 'provider', 'provider_account_id', 'type']
    list_filter = ['provider', 'type']
    search_fields = ['user__email', 'provider_account_id']
    readonly_fields = [
        'id', 'user', 'type', 'provider', 'provider_account_id',
        'refresh_token', 'access_token', 'expires_at', 'token_type',
        'scope', 'id_token', 'session_state'
    ]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(AuthSession)
class AuthSessionAdmin(admin.ModelAdmin):
    """Admin interface for AuthSession (read-only)"""
    list_display = ['user', 'session_token_short', 'expires']
    list_filter = ['expires']
    search_fields = ['user__email', 'session_token']
    readonly_fields = ['id', 'user', 'session_token', 'expires']
    ordering = ['-expires']

    def session_token_short(self, obj):
        return f"{obj.session_token[:20]}..." if obj.session_token else ""
    session_token_short.short_description = 'Session Token'

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(VerificationToken)
class VerificationTokenAdmin(admin.ModelAdmin):
    """Admin interface for VerificationToken (read-only)"""
    list_display = ['identifier', 'token_short', 'expires']
    list_filter = ['expires']
    search_fields = ['identifier', 'token']
    readonly_fields = ['identifier', 'token', 'expires']
    ordering = ['-expires']

    def token_short(self, obj):
        return f"{obj.token[:20]}..." if obj.token else ""
    token_short.short_description = 'Token'

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
