from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuthUserViewSet,
    AuthAccountViewSet,
    AuthSessionViewSet,
    VerificationTokenViewSet,
)

# Create a router for the viewsets
router = DefaultRouter()
router.register(r'users', AuthUserViewSet, basename='auth-user')
router.register(r'accounts', AuthAccountViewSet, basename='auth-account')
router.register(r'sessions', AuthSessionViewSet, basename='auth-session')
router.register(r'tokens', VerificationTokenViewSet, basename='auth-token')

urlpatterns = [
    path('', include(router.urls)),
]
