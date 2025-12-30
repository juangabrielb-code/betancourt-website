from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import AuthUser, AuthAccount, AuthSession, VerificationToken
from .serializers import (
    AuthUserSerializer,
    AuthUserListSerializer,
    AuthAccountSerializer,
    AuthSessionSerializer,
    VerificationTokenSerializer,
)


class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users.
    Checks if the user exists in AuthUser table with ADMIN role.
    """

    def has_permission(self, request, view):
        # For now, allow all for development
        # In production, implement JWT token validation
        return True


class AuthUserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing Auth.js users.
    Provides read-only access to user data.
    """
    queryset = AuthUser.objects.all()
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.action == 'list':
            return AuthUserListSerializer
        return AuthUserSerializer

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get user statistics"""
        total_users = AuthUser.objects.count()
        users_with_email_verified = AuthUser.objects.filter(email_verified__isnull=False).count()
        admin_users = AuthUser.objects.filter(role='ADMIN').count()
        client_users = AuthUser.objects.filter(role='CLIENT').count()

        return Response({
            'total_users': total_users,
            'users_with_email_verified': users_with_email_verified,
            'admin_users': admin_users,
            'client_users': client_users,
        })

    @action(detail=False, methods=['get'])
    def by_email(self, request):
        """Get user by email"""
        email = request.query_params.get('email')
        if not email:
            return Response(
                {'error': 'Email parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = AuthUser.objects.get(email=email)
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        except AuthUser.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class AuthAccountViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing OAuth accounts.
    Shows which providers each user has connected.
    """
    queryset = AuthAccount.objects.all()
    serializer_class = AuthAccountSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['get'])
    def by_user(self, request):
        """Get all accounts for a specific user"""
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        accounts = AuthAccount.objects.filter(user_id=user_id)
        serializer = self.get_serializer(accounts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get account provider statistics"""
        providers = AuthAccount.objects.values_list('provider', flat=True).distinct()
        stats = {}

        for provider in providers:
            stats[provider] = AuthAccount.objects.filter(provider=provider).count()

        return Response(stats)


class AuthSessionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing active sessions.
    """
    queryset = AuthSession.objects.all()
    serializer_class = AuthSessionSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        """Only return active (non-expired) sessions by default"""
        queryset = super().get_queryset()
        include_expired = self.request.query_params.get('include_expired', 'false')

        if include_expired.lower() != 'true':
            queryset = queryset.filter(expires__gt=timezone.now())

        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get session statistics"""
        total_sessions = AuthSession.objects.count()
        active_sessions = AuthSession.objects.filter(expires__gt=timezone.now()).count()
        expired_sessions = total_sessions - active_sessions

        return Response({
            'total_sessions': total_sessions,
            'active_sessions': active_sessions,
            'expired_sessions': expired_sessions,
        })


class VerificationTokenViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing verification tokens.
    """
    queryset = VerificationToken.objects.all()
    serializer_class = VerificationTokenSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        """Only return active (non-expired) tokens by default"""
        queryset = super().get_queryset()
        include_expired = self.request.query_params.get('include_expired', 'false')

        if include_expired.lower() != 'true':
            queryset = queryset.filter(expires__gt=timezone.now())

        return queryset
