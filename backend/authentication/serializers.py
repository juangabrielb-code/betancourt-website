from rest_framework import serializers
from .models import AuthUser, AuthAccount, AuthSession, VerificationToken


class AuthAccountSerializer(serializers.ModelSerializer):
    """Serializer for AuthAccount model"""

    class Meta:
        model = AuthAccount
        fields = [
            'id',
            'type',
            'provider',
            'provider_account_id',
            'token_type',
        ]
        # Exclude sensitive fields like tokens


class AuthUserSerializer(serializers.ModelSerializer):
    """Serializer for AuthUser model with related accounts"""
    accounts = AuthAccountSerializer(many=True, read_only=True)

    class Meta:
        model = AuthUser
        fields = [
            'id',
            'name',
            'email',
            'email_verified',
            'image',
            'role',
            'created_at',
            'updated_at',
            'accounts',
        ]
        read_only_fields = fields  # All fields are read-only


class AuthUserListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for user lists"""

    class Meta:
        model = AuthUser
        fields = [
            'id',
            'name',
            'email',
            'role',
            'created_at',
        ]
        read_only_fields = fields


class AuthSessionSerializer(serializers.ModelSerializer):
    """Serializer for AuthSession model"""
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = AuthSession
        fields = [
            'id',
            'user',
            'user_email',
            'expires',
        ]
        read_only_fields = fields


class VerificationTokenSerializer(serializers.ModelSerializer):
    """Serializer for VerificationToken model"""

    class Meta:
        model = VerificationToken
        fields = [
            'identifier',
            'expires',
        ]
        read_only_fields = fields
