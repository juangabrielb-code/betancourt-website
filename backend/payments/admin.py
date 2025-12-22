"""
Admin configuration for Producer Hub payment models
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Service, Order, Transaction, ExchangeRate


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    """Admin interface for Service model"""
    list_display = ['name', 'display_price_usd', 'display_price_cop', 'iva_percentage', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']

    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'description', 'is_active')
        }),
        ('Precios', {
            'fields': ('base_price_usd', 'base_price_cop', 'iva_percentage')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def display_price_usd(self, obj):
        """Display formatted USD price"""
        return f"${obj.base_price_usd}"
    display_price_usd.short_description = 'Precio USD'

    def display_price_cop(self, obj):
        """Display formatted COP price"""
        if obj.base_price_cop:
            return f"${obj.base_price_cop:,.0f}"
        return '-'
    display_price_cop.short_description = 'Precio COP'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Admin interface for Order model"""
    list_display = [
        'order_number',
        'customer_name',
        'service',
        'display_total',
        'currency',
        'payment_gateway',
        'status_badge',
        'created_at'
    ]
    list_filter = ['status', 'currency', 'payment_gateway', 'created_at']
    search_fields = ['order_number', 'customer_name', 'customer_email']
    readonly_fields = [
        'id',
        'order_number',
        'created_at',
        'updated_at',
        'paid_at',
        'transaction_count'
    ]

    fieldsets = (
        ('Información de la Orden', {
            'fields': ('order_number', 'status', 'user', 'service')
        }),
        ('Cliente', {
            'fields': ('customer_name', 'customer_email')
        }),
        ('Detalles de Pago', {
            'fields': (
                'currency',
                'payment_gateway',
                'exchange_rate',
                'subtotal',
                'tax_amount',
                'withholding_amount',
                'total'
            )
        }),
        ('Transacciones', {
            'fields': ('transaction_count',),
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at', 'paid_at'),
            'classes': ('collapse',)
        }),
    )

    def display_total(self, obj):
        """Display formatted total with currency"""
        if obj.currency == 'USD':
            return f"${obj.total}"
        else:
            return f"${obj.total:,.0f} COP"
    display_total.short_description = 'Total'

    def status_badge(self, obj):
        """Display status with color badge"""
        colors = {
            'PENDING': '#FFA500',
            'PROCESSING': '#1E90FF',
            'PAID': '#28a745',
            'FAILED': '#dc3545',
            'CANCELLED': '#6c757d',
            'REFUNDED': '#17a2b8'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Estado'

    def transaction_count(self, obj):
        """Count related transactions"""
        count = obj.transactions.count()
        if count == 0:
            return format_html('<span style="color: #dc3545;">Sin transacciones</span>')
        return format_html(
            '<a href="/admin/payments/transaction/?order__id__exact={}">{} transacción(es)</a>',
            obj.id,
            count
        )
    transaction_count.short_description = 'Transacciones'


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """Admin interface for Transaction model"""
    list_display = [
        'external_id',
        'order',
        'display_amount',
        'payment_gateway',
        'transaction_type',
        'status_badge',
        'created_at'
    ]
    list_filter = [
        'status',
        'transaction_type',
        'payment_gateway',
        'currency',
        'created_at'
    ]
    search_fields = [
        'external_id',
        'payment_intent_id',
        'order__order_number',
        'error_code'
    ]
    readonly_fields = [
        'id',
        'created_at',
        'updated_at',
        'processed_at',
        'formatted_webhook',
        'formatted_gateway_response'
    ]

    fieldsets = (
        ('Información de la Transacción', {
            'fields': (
                'order',
                'external_id',
                'payment_intent_id',
                'transaction_type',
                'status',
                'payment_gateway'
            )
        }),
        ('Montos', {
            'fields': ('amount', 'currency', 'refunded_amount')
        }),
        ('Datos de Pasarela', {
            'fields': ('formatted_webhook', 'formatted_gateway_response'),
        }),
        ('Errores', {
            'fields': ('error_code', 'error_message'),
            'classes': ('collapse',)
        }),
        ('Reembolso', {
            'fields': ('refund_reason',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at', 'processed_at'),
            'classes': ('collapse',)
        }),
    )

    def display_amount(self, obj):
        """Display formatted amount with currency"""
        if obj.currency == 'USD':
            return f"${obj.amount}"
        else:
            return f"${obj.amount:,.0f} COP"
    display_amount.short_description = 'Monto'

    def status_badge(self, obj):
        """Display status with color badge"""
        colors = {
            'PENDING': '#FFA500',
            'PROCESSING': '#1E90FF',
            'SUCCESS': '#28a745',
            'FAILED': '#dc3545',
            'CANCELLED': '#6c757d',
            'REFUNDED': '#17a2b8'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Estado'

    def formatted_webhook(self, obj):
        """Display formatted webhook payload"""
        if obj.webhook_payload:
            import json
            formatted_json = json.dumps(obj.webhook_payload, indent=2, ensure_ascii=False)
            return format_html('<pre style="max-height: 400px; overflow: auto;">{}</pre>', formatted_json)
        return '-'
    formatted_webhook.short_description = 'Webhook Payload'

    def formatted_gateway_response(self, obj):
        """Display formatted gateway response"""
        if obj.gateway_response:
            import json
            formatted_json = json.dumps(obj.gateway_response, indent=2, ensure_ascii=False)
            return format_html('<pre style="max-height: 400px; overflow: auto;">{}</pre>', formatted_json)
        return '-'
    formatted_gateway_response.short_description = 'Gateway Response'


@admin.register(ExchangeRate)
class ExchangeRateAdmin(admin.ModelAdmin):
    """Admin interface for ExchangeRate model"""
    list_display = [
        'currency_pair',
        'rate',
        'source',
        'effective_date',
        'created_at'
    ]
    list_filter = ['from_currency', 'to_currency', 'source', 'effective_date']
    search_fields = ['source']
    readonly_fields = ['id', 'created_at']

    fieldsets = (
        ('Tasa de Cambio', {
            'fields': ('from_currency', 'to_currency', 'rate', 'source', 'effective_date')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at'),
            'classes': ('collapse',)
        }),
    )

    def currency_pair(self, obj):
        """Display currency pair"""
        return f"{obj.from_currency}/{obj.to_currency}"
    currency_pair.short_description = 'Par de Monedas'
