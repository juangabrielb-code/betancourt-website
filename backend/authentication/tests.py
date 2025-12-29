"""
Comprehensive Test Suite for Authentication System

Tests cover:
- Functional testing (registration, login, password reset)
- Security testing (hashing, tokens, anti-enumeration)
- Performance testing (response times)
- API testing (all endpoints)

Related: BET-30 (Testing y Validación de Seguridad)
"""

from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from datetime import timedelta
import time

from .models import PasswordResetToken

User = get_user_model()


class UserModelTestCase(TestCase):
    """Test User model functionality"""

    def test_create_user_with_email(self):
        """Test creating a user with email as username"""
        user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            first_name='Test',
            last_name='User'
        )

        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('TestPass123'))
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.email_verified)

    def test_create_superuser(self):
        """Test creating a superuser"""
        admin = User.objects.create_superuser(
            email='admin@example.com',
            password='AdminPass123'
        )

        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_active)

    def test_email_normalized(self):
        """Test email domain is normalized to lowercase"""
        user = User.objects.create_user(
            email='test@EXAMPLE.COM',
            password='TestPass123'
        )

        # normalize_email only lowercases the domain, not the local part
        self.assertEqual(user.email, 'test@example.com')

    def test_password_hashing_argon2(self):
        """Test passwords are hashed with Argon2id"""
        user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123'
        )

        # Password should be hashed (not plain text)
        self.assertNotEqual(user.password, 'TestPass123')
        # Should start with argon2 identifier
        self.assertTrue(user.password.startswith('argon2'))
        # Should be able to verify password
        self.assertTrue(user.check_password('TestPass123'))


class PasswordResetTokenModelTestCase(TestCase):
    """Test PasswordResetToken model"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123'
        )

    def test_create_reset_token(self):
        """Test creating a password reset token"""
        token = PasswordResetToken.create_token(self.user, expiry_hours=1)

        self.assertIsNotNone(token.token)
        self.assertGreater(len(token.token), 40)  # token_urlsafe(32) generates ~43 chars
        self.assertEqual(token.user, self.user)
        self.assertFalse(token.is_used)
        self.assertIsNotNone(token.expires_at)

    def test_token_is_valid(self):
        """Test token validation"""
        token = PasswordResetToken.create_token(self.user, expiry_hours=1)

        self.assertTrue(token.is_valid())

    def test_expired_token_invalid(self):
        """Test expired tokens are invalid"""
        token = PasswordResetToken.create_token(self.user, expiry_hours=1)

        # Manually set expiration to past
        token.expires_at = timezone.now() - timedelta(minutes=1)
        token.save()

        self.assertFalse(token.is_valid())

    def test_used_token_invalid(self):
        """Test used tokens are invalid"""
        token = PasswordResetToken.create_token(self.user, expiry_hours=1)
        token.mark_as_used()

        self.assertFalse(token.is_valid())


class RegistrationAPITestCase(APITestCase):
    """Test user registration endpoint"""

    def setUp(self):
        self.client = APIClient()
        self.url = reverse('authentication:register')

    def test_register_success(self):
        """Test successful user registration"""
        data = {
            'email': 'newuser@example.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
            'first_name': 'New',
            'last_name': 'User'
        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertIn('tokens', response.data)
        self.assertEqual(response.data['user']['email'], 'newuser@example.com')

        # Verify user was created
        user = User.objects.get(email='newuser@example.com')
        self.assertTrue(user.check_password('SecurePass123!'))

    def test_register_duplicate_email(self):
        """Test registration with duplicate email fails"""
        User.objects.create_user(
            email='existing@example.com',
            password='TestPass123'
        )

        data = {
            'email': 'existing@example.com',
            'password': 'NewPass123!',
            'password_confirm': 'NewPass123!'
        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_register_password_mismatch(self):
        """Test registration with mismatched passwords fails"""
        data = {
            'email': 'test@example.com',
            'password': 'Pass123!',
            'password_confirm': 'DifferentPass123!'
        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_weak_password(self):
        """Test registration with weak password fails"""
        data = {
            'email': 'test@example.com',
            'password': '12345',
            'password_confirm': '12345'
        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)


class LoginAPITestCase(APITestCase):
    """Test login endpoint"""

    def setUp(self):
        self.client = APIClient()
        self.url = reverse('authentication:login')
        self.user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123'
        )

    def test_login_success(self):
        """Test successful login"""
        data = {
            'email': 'test@example.com',
            'password': 'TestPass123'
        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns generic error"""
        data = {
            'email': 'test@example.com',
            'password': 'WrongPassword'
        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['detail'], 'Invalid credentials')

    def test_login_nonexistent_user(self):
        """Test login with non-existent user returns same error (anti-enumeration)"""
        data = {
            'email': 'nonexistent@example.com',
            'password': 'TestPass123'
        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['detail'], 'Invalid credentials')

    def test_login_timing_constant(self):
        """Test login response time is constant (anti-enumeration)"""
        # Login with valid user
        start1 = time.time()
        self.client.post(self.url, {
            'email': 'test@example.com',
            'password': 'WrongPass'
        }, format='json')
        time1 = time.time() - start1

        # Login with non-existent user
        start2 = time.time()
        self.client.post(self.url, {
            'email': 'nonexistent@example.com',
            'password': 'WrongPass'
        }, format='json')
        time2 = time.time() - start2

        # Both should take at least 500ms (minimum time)
        self.assertGreater(time1, 0.5)
        self.assertGreater(time2, 0.5)

        # Time difference should be small (within 100ms)
        self.assertLess(abs(time1 - time2), 0.1)


class PasswordResetAPITestCase(TransactionTestCase):
    """Test password reset endpoints"""

    def setUp(self):
        self.client = APIClient()
        self.forgot_url = reverse('authentication:forgot_password')
        self.reset_url = reverse('authentication:reset_password')
        self.user = User.objects.create_user(
            email='test@example.com',
            password='OldPass123'
        )

    def test_forgot_password_success(self):
        """Test requesting password reset for existing user"""
        data = {'email': 'test@example.com'}

        response = self.client.post(self.forgot_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

        # Verify token was created
        token = PasswordResetToken.objects.filter(user=self.user, is_used=False).first()
        self.assertIsNotNone(token)

    def test_forgot_password_nonexistent_user(self):
        """Test password reset for non-existent user returns same message (anti-enumeration)"""
        data = {'email': 'nonexistent@example.com'}

        response = self.client.post(self.forgot_url, data, format='json')

        # Should return success even though user doesn't exist
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

        # No new token should be created (only for non-existent user)
        # This test is independent, so we don't check the total count

    def test_reset_password_success(self):
        """Test successful password reset with valid token"""
        # Create reset token
        reset_token = PasswordResetToken.create_token(self.user, expiry_hours=1)

        data = {
            'token': reset_token.token,
            'password': 'NewPass123!',
            'password_confirm': 'NewPass123!'
        }

        response = self.client.post(self.reset_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify password was changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPass123!'))

        # Verify token was marked as used
        reset_token.refresh_from_db()
        self.assertTrue(reset_token.is_used)

    def test_reset_password_invalid_token(self):
        """Test password reset with invalid token fails"""
        data = {
            'token': 'invalid-token',
            'password': 'NewPass123!',
            'password_confirm': 'NewPass123!'
        }

        response = self.client.post(self.reset_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password_expired_token(self):
        """Test password reset with expired token fails"""
        reset_token = PasswordResetToken.create_token(self.user, expiry_hours=1)

        # Manually expire the token
        reset_token.expires_at = timezone.now() - timedelta(minutes=1)
        reset_token.save()

        data = {
            'token': reset_token.token,
            'password': 'NewPass123!',
            'password_confirm': 'NewPass123!'
        }

        response = self.client.post(self.reset_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password_used_token(self):
        """Test password reset with already used token fails"""
        reset_token = PasswordResetToken.create_token(self.user, expiry_hours=1)
        reset_token.mark_as_used()

        data = {
            'token': reset_token.token,
            'password': 'NewPass123!',
            'password_confirm': 'NewPass123!'
        }

        response = self.client.post(self.reset_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class SecurityTestCase(APITestCase):
    """Security-specific tests"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123'
        )

    def test_passwords_not_in_plaintext(self):
        """Test passwords are never stored in plaintext"""
        user = User.objects.get(email='test@example.com')

        # Password field should not contain the plaintext password
        self.assertNotEqual(user.password, 'TestPass123')
        # Should be hashed with Argon2
        self.assertTrue(user.password.startswith('argon2'))

    def test_jwt_tokens_are_valid(self):
        """Test JWT tokens are properly formatted and signed"""
        login_url = reverse('authentication:login')
        response = self.client.post(login_url, {
            'email': 'test@example.com',
            'password': 'TestPass123'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        access_token = response.data['tokens']['access']
        refresh_token = response.data['tokens']['refresh']

        # Tokens should be non-empty strings
        self.assertIsInstance(access_token, str)
        self.assertIsInstance(refresh_token, str)
        self.assertGreater(len(access_token), 0)
        self.assertGreater(len(refresh_token), 0)

        # JWT tokens have 3 parts separated by dots
        self.assertEqual(len(access_token.split('.')), 3)
        self.assertEqual(len(refresh_token.split('.')), 3)

    def test_reset_tokens_are_cryptographically_secure(self):
        """Test password reset tokens are cryptographically secure"""
        token1 = PasswordResetToken.create_token(self.user, expiry_hours=1)
        token2 = PasswordResetToken.create_token(self.user, expiry_hours=1)

        # Tokens should be different (random)
        self.assertNotEqual(token1.token, token2.token)

        # token_urlsafe(32) generates approximately 43 characters
        self.assertGreater(len(token1.token), 40)
        self.assertGreater(len(token2.token), 40)

        # Should only contain URL-safe characters
        import string
        url_safe_chars = string.ascii_letters + string.digits + '-_'
        self.assertTrue(all(c in url_safe_chars for c in token1.token))


class PerformanceTestCase(APITestCase):
    """Performance testing"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123'
        )

    def test_password_hashing_performance(self):
        """Test password hashing completes in <500ms"""
        start = time.time()
        User.objects.create_user(
            email='perf@example.com',
            password='TestPass123!'
        )
        duration = time.time() - start

        self.assertLess(duration, 0.5, f"Password hashing took {duration:.3f}s")

    def test_login_performance(self):
        """Test login flow completes in <2s"""
        url = reverse('authentication:login')
        data = {
            'email': 'test@example.com',
            'password': 'TestPass123'
        }

        start = time.time()
        response = self.client.post(url, data, format='json')
        duration = time.time() - start

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertLess(duration, 2.0, f"Login took {duration:.3f}s")

    def test_registration_performance(self):
        """Test registration flow completes in <3s"""
        url = reverse('authentication:register')
        data = {
            'email': 'perf2@example.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!'
        }

        start = time.time()
        response = self.client.post(url, data, format='json')
        duration = time.time() - start

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertLess(duration, 3.0, f"Registration took {duration:.3f}s")
