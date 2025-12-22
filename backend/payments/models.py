"""
Producer Hub - Sistema de Pagos Multi-Pasarela y Multi-Moneda
Arquitectura diseñada para manejar:
- Pagos internacionales (USD) vía Stripe → Payoneer
- Pagos nacionales Colombia (COP) vía Bold/Mercado Pago con IVA/Retenciones
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from django.utils import timezone
import uuid


# ==================== CHOICES / ENUMS ====================

class Currency(models.TextChoices):
    """Monedas soportadas en la plataforma"""
    USD = 'USD', 'US Dollar'
    COP = 'COP', 'Colombian Peso'


class PaymentGateway(models.TextChoices):
    """Pasarelas de pago disponibles"""
    STRIPE = 'STRIPE', 'Stripe'
    BOLD = 'BOLD', 'Bold'
    MERCADO_PAGO = 'MERCADO_PAGO', 'Mercado Pago'


class OrderStatus(models.TextChoices):
    """Estados del ciclo de vida de una orden"""
    PENDING = 'PENDING', 'Pendiente de Pago'
    PROCESSING = 'PROCESSING', 'Procesando Pago'
    PAID = 'PAID', 'Pagado'
    FAILED = 'FAILED', 'Pago Fallido'
    CANCELLED = 'CANCELLED', 'Cancelado'
    REFUNDED = 'REFUNDED', 'Reembolsado'


class TransactionStatus(models.TextChoices):
    """Estados de una transacción individual"""
    PENDING = 'PENDING', 'Pendiente'
    PROCESSING = 'PROCESSING', 'Procesando'
    SUCCESS = 'SUCCESS', 'Exitosa'
    FAILED = 'FAILED', 'Fallida'
    CANCELLED = 'CANCELLED', 'Cancelada'
    REFUNDED = 'REFUNDED', 'Reembolsada'


class TransactionType(models.TextChoices):
    """Tipos de transacción"""
    PAYMENT = 'PAYMENT', 'Pago'
    REFUND = 'REFUND', 'Reembolso'
    PARTIAL_REFUND = 'PARTIAL_REFUND', 'Reembolso Parcial'


# ==================== MODELOS PRINCIPALES ====================

class Service(models.Model):
    """
    Servicios/Productos ofrecidos en la plataforma
    Maneja precios multi-moneda con conversión automática
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="Nombre del Servicio")
    description = models.TextField(verbose_name="Descripción")

    # Precios base en ambas monedas
    base_price_usd = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name="Precio Base USD",
        help_text="Precio en dólares estadounidenses"
    )
    base_price_cop = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name="Precio Base COP",
        help_text="Precio en pesos colombianos (opcional, se calcula automáticamente si no se provee)"
    )

    # Configuración de impuestos (Colombia)
    iva_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('19.00'),
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('100'))],
        verbose_name="Porcentaje IVA",
        help_text="IVA aplicable en Colombia (default 19%)"
    )

    # Metadata
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Servicio"
        verbose_name_plural = "Servicios"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} (${self.base_price_usd} USD)"

    def get_price(self, currency, exchange_rate=None):
        """
        Obtiene el precio en la moneda solicitada

        Args:
            currency: Currency.USD o Currency.COP
            exchange_rate: Tasa de cambio USD->COP (si no se provee, usa base_price_cop)

        Returns:
            Decimal: Precio en la moneda solicitada
        """
        if currency == Currency.USD:
            return self.base_price_usd

        # Para COP, usar precio manual o calcular con tasa de cambio
        if self.base_price_cop:
            return self.base_price_cop

        if exchange_rate:
            return self.base_price_usd * Decimal(str(exchange_rate))

        # Fallback: usar tasa de cambio por defecto (4000 COP/USD aproximadamente)
        DEFAULT_EXCHANGE_RATE = Decimal('4000.00')
        return self.base_price_usd * DEFAULT_EXCHANGE_RATE

    def calculate_tax(self, base_amount):
        """
        Calcula el IVA sobre un monto base

        Args:
            base_amount: Monto base sobre el cual calcular el IVA

        Returns:
            Decimal: Monto del IVA
        """
        return (base_amount * self.iva_percentage / Decimal('100')).quantize(Decimal('0.01'))


class Order(models.Model):
    """
    Orden de compra con soporte multi-moneda y multi-pasarela
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(
        max_length=50,
        unique=True,
        editable=False,
        verbose_name="Número de Orden"
    )

    # Relaciones
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='orders',
        verbose_name="Usuario"
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.PROTECT,
        related_name='orders',
        verbose_name="Servicio"
    )

    # Información de pago
    currency = models.CharField(
        max_length=3,
        choices=Currency.choices,
        verbose_name="Moneda"
    )
    payment_gateway = models.CharField(
        max_length=20,
        choices=PaymentGateway.choices,
        verbose_name="Pasarela de Pago"
    )

    # Montos
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Subtotal",
        help_text="Monto antes de impuestos"
    )
    tax_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name="Impuestos (IVA)",
        help_text="Monto de impuestos aplicados (principalmente para COP)"
    )
    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Total",
        help_text="Monto total a pagar (subtotal + impuestos)"
    )

    # Tasa de cambio (crítica para auditoría)
    exchange_rate = models.DecimalField(
        max_digits=10,
        decimal_places=4,
        null=True,
        blank=True,
        verbose_name="Tasa de Cambio",
        help_text="Tasa USD->COP utilizada en el momento de la orden"
    )

    # Estado y timestamps
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING,
        verbose_name="Estado"
    )

    # Metadata para Colombia (retenciones, etc.)
    withholding_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name="Retención en la Fuente",
        help_text="Retención aplicable en Colombia"
    )

    # Información adicional
    customer_email = models.EmailField(verbose_name="Email del Cliente")
    customer_name = models.CharField(max_length=255, verbose_name="Nombre del Cliente")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True, verbose_name="Fecha de Pago")

    class Meta:
        verbose_name = "Orden"
        verbose_name_plural = "Órdenes"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order_number']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Orden {self.order_number} - {self.get_currency_display()} {self.total}"

    def save(self, *args, **kwargs):
        """Genera número de orden único si no existe"""
        if not self.order_number:
            # Formato: PH-YYYYMMDD-XXXX (PH = Producer Hub)
            from django.utils.crypto import get_random_string
            date_str = timezone.now().strftime('%Y%m%d')
            random_str = get_random_string(length=6, allowed_chars='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')
            self.order_number = f"PH-{date_str}-{random_str}"

        super().save(*args, **kwargs)

    def calculate_totals(self, service, exchange_rate=None):
        """
        Calcula subtotal, impuestos y total basado en el servicio y moneda

        Args:
            service: Instancia de Service
            exchange_rate: Tasa de cambio si la moneda es COP
        """
        # Obtener precio base en la moneda correcta
        self.subtotal = service.get_price(self.currency, exchange_rate)

        # Calcular impuestos solo para COP (Colombia)
        if self.currency == Currency.COP:
            self.tax_amount = service.calculate_tax(self.subtotal)
        else:
            self.tax_amount = Decimal('0.00')

        # Calcular total
        self.total = self.subtotal + self.tax_amount

        # Guardar tasa de cambio si es COP
        if self.currency == Currency.COP and exchange_rate:
            self.exchange_rate = Decimal(str(exchange_rate))

    def mark_as_paid(self):
        """Marca la orden como pagada"""
        self.status = OrderStatus.PAID
        self.paid_at = timezone.now()
        self.save(update_fields=['status', 'paid_at', 'updated_at'])


class Transaction(models.Model):
    """
    Registro de transacciones individuales
    Almacena todos los intentos de pago, respuestas de webhooks y estado
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Relación con la orden
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='transactions',
        verbose_name="Orden"
    )

    # Identificadores externos
    external_id = models.CharField(
        max_length=255,
        unique=True,
        verbose_name="ID Externo",
        help_text="ID de transacción provisto por Stripe, Bold, o Mercado Pago"
    )
    payment_intent_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name="Payment Intent ID",
        help_text="ID del intent de pago (específico de Stripe)"
    )

    # Información de la transacción
    transaction_type = models.CharField(
        max_length=20,
        choices=TransactionType.choices,
        default=TransactionType.PAYMENT,
        verbose_name="Tipo de Transacción"
    )
    status = models.CharField(
        max_length=20,
        choices=TransactionStatus.choices,
        default=TransactionStatus.PENDING,
        verbose_name="Estado"
    )

    # Montos
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Monto"
    )
    currency = models.CharField(
        max_length=3,
        choices=Currency.choices,
        verbose_name="Moneda"
    )

    # Gateway utilizado
    payment_gateway = models.CharField(
        max_length=20,
        choices=PaymentGateway.choices,
        verbose_name="Pasarela de Pago"
    )

    # Webhook y respuestas (JSON para flexibilidad)
    webhook_payload = models.JSONField(
        null=True,
        blank=True,
        verbose_name="Payload del Webhook",
        help_text="Datos completos recibidos del webhook para auditoría"
    )
    gateway_response = models.JSONField(
        null=True,
        blank=True,
        verbose_name="Respuesta de la Pasarela",
        help_text="Respuesta original de la API de la pasarela"
    )

    # Mensajes de error
    error_code = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name="Código de Error"
    )
    error_message = models.TextField(
        null=True,
        blank=True,
        verbose_name="Mensaje de Error"
    )

    # Información de reembolso
    refunded_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name="Monto Reembolsado"
    )
    refund_reason = models.TextField(
        null=True,
        blank=True,
        verbose_name="Razón del Reembolso"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creado")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Actualizado")
    processed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Procesado en"
    )

    class Meta:
        verbose_name = "Transacción"
        verbose_name_plural = "Transacciones"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['external_id']),
            models.Index(fields=['order', '-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['payment_gateway', 'status']),
        ]

    def __str__(self):
        return f"Transacción {self.external_id} - {self.get_status_display()}"

    def mark_as_success(self):
        """Marca la transacción como exitosa y actualiza la orden"""
        self.status = TransactionStatus.SUCCESS
        self.processed_at = timezone.now()
        self.save(update_fields=['status', 'processed_at', 'updated_at'])

        # Actualizar la orden asociada
        self.order.mark_as_paid()

    def mark_as_failed(self, error_code=None, error_message=None):
        """Marca la transacción como fallida"""
        self.status = TransactionStatus.FAILED
        self.processed_at = timezone.now()
        if error_code:
            self.error_code = error_code
        if error_message:
            self.error_message = error_message
        self.save(update_fields=['status', 'processed_at', 'error_code', 'error_message', 'updated_at'])

        # Actualizar estado de la orden
        self.order.status = OrderStatus.FAILED
        self.order.save(update_fields=['status', 'updated_at'])


class ExchangeRate(models.Model):
    """
    Historial de tasas de cambio USD -> COP
    Permite mantener un registro histórico para auditoría
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    from_currency = models.CharField(
        max_length=3,
        choices=Currency.choices,
        default=Currency.USD,
        verbose_name="Moneda Origen"
    )
    to_currency = models.CharField(
        max_length=3,
        choices=Currency.choices,
        default=Currency.COP,
        verbose_name="Moneda Destino"
    )

    rate = models.DecimalField(
        max_digits=10,
        decimal_places=4,
        verbose_name="Tasa de Cambio",
        help_text="Cuántas unidades de la moneda destino por 1 unidad de origen"
    )

    # Fuente de la tasa
    source = models.CharField(
        max_length=100,
        default='Manual',
        verbose_name="Fuente",
        help_text="API o fuente de donde se obtuvo la tasa (ej: OpenExchangeRates, Manual)"
    )

    # Timestamps
    effective_date = models.DateTimeField(
        default=timezone.now,
        verbose_name="Fecha Efectiva"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Tasa de Cambio"
        verbose_name_plural = "Tasas de Cambio"
        ordering = ['-effective_date']
        indexes = [
            models.Index(fields=['from_currency', 'to_currency', '-effective_date']),
        ]

    def __str__(self):
        return f"{self.from_currency}/{self.to_currency}: {self.rate} ({self.effective_date.date()})"

    @classmethod
    def get_latest_rate(cls, from_currency=Currency.USD, to_currency=Currency.COP):
        """Obtiene la tasa de cambio más reciente"""
        rate_obj = cls.objects.filter(
            from_currency=from_currency,
            to_currency=to_currency
        ).first()

        return rate_obj.rate if rate_obj else Decimal('4000.00')  # Fallback
