from django.db import models


class AuthUser(models.Model):
    """
    Read-only model to access Next-Auth users table.
    This model uses managed=False to prevent Django from managing the table.
    The table is created and managed by Prisma/Auth.js.
    """
    id = models.CharField(max_length=255, primary_key=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(unique=True)
    email_verified = models.DateTimeField(null=True, blank=True, db_column='emailVerified')
    image = models.URLField(null=True, blank=True)
    role = models.CharField(max_length=50, default='CLIENT')
    created_at = models.DateTimeField(auto_now_add=True, db_column='createdAt')
    updated_at = models.DateTimeField(auto_now=True, db_column='updatedAt')

    class Meta:
        managed = False
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return self.email


class AuthAccount(models.Model):
    """
    Read-only model to access Next-Auth accounts table.
    Links users to their OAuth providers.
    """
    id = models.CharField(max_length=255, primary_key=True)
    user = models.ForeignKey(AuthUser, on_delete=models.DO_NOTHING, db_column='userId', related_name='accounts')
    type = models.CharField(max_length=255)
    provider = models.CharField(max_length=255)
    provider_account_id = models.CharField(max_length=255, db_column='providerAccountId')
    refresh_token = models.TextField(null=True, blank=True)
    access_token = models.TextField(null=True, blank=True)
    expires_at = models.BigIntegerField(null=True, blank=True)
    token_type = models.CharField(max_length=255, null=True, blank=True)
    scope = models.TextField(null=True, blank=True)
    id_token = models.TextField(null=True, blank=True)
    session_state = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'accounts'
        unique_together = [['provider', 'provider_account_id']]

    def __str__(self):
        return f"{self.user.email} - {self.provider}"


class AuthSession(models.Model):
    """
    Read-only model to access Next-Auth sessions table.
    Stores active user sessions.
    """
    id = models.CharField(max_length=255, primary_key=True)
    session_token = models.CharField(max_length=255, unique=True, db_column='sessionToken')
    user = models.ForeignKey(AuthUser, on_delete=models.DO_NOTHING, db_column='userId', related_name='sessions')
    expires = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'sessions'

    def __str__(self):
        return f"{self.user.email} - {self.session_token[:20]}..."


class VerificationToken(models.Model):
    """
    Read-only model to access Next-Auth verification_tokens table.
    Used for email verification flows.
    """
    identifier = models.CharField(max_length=255)
    token = models.CharField(max_length=255, unique=True)
    expires = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'verification_tokens'
        unique_together = [['identifier', 'token']]

    def __str__(self):
        return f"{self.identifier} - {self.token[:20]}..."
