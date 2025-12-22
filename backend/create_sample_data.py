"""
Script to create sample data for Producer Hub payment system
"""
import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from payments.models import Service, Order, Transaction, ExchangeRate, Currency, PaymentGateway

User = get_user_model()

def create_sample_data():
    print("🚀 Creando datos de ejemplo para Producer Hub...\n")

    # 1. Crear tasa de cambio actual
    print("💱 Creando tasa de cambio USD/COP...")
    exchange_rate = ExchangeRate.objects.create(
        from_currency=Currency.USD,
        to_currency=Currency.COP,
        rate=Decimal('4150.00'),
        source='Manual - Ejemplo',
    )
    print(f"   ✅ Tasa creada: 1 USD = {exchange_rate.rate} COP\n")

    # 2. Crear servicios de ejemplo
    print("🎵 Creando servicios de producción musical...")

    services_data = [
        {
            'name': 'Mezcla Profesional',
            'description': 'Mezcla profesional de hasta 10 stems con procesamiento de audio de alta calidad',
            'base_price_usd': Decimal('150.00'),
            'base_price_cop': Decimal('600000.00'),
            'iva_percentage': Decimal('19.00'),
        },
        {
            'name': 'Masterización',
            'description': 'Masterización profesional para plataformas digitales',
            'base_price_usd': Decimal('80.00'),
            'base_price_cop': Decimal('320000.00'),
            'iva_percentage': Decimal('19.00'),
        },
        {
            'name': 'Producción Completa',
            'description': 'Producción musical completa: composición, arreglos, mezcla y master',
            'base_price_usd': Decimal('500.00'),
            'base_price_cop': Decimal('2000000.00'),
            'iva_percentage': Decimal('19.00'),
        },
    ]

    services = []
    for data in services_data:
        service = Service.objects.create(**data)
        services.append(service)
        print(f"   ✅ {service.name}: USD ${service.base_price_usd} | COP ${service.base_price_cop:,.0f}")

    print(f"\n✅ {len(services)} servicios creados exitosamente!\n")

    # 3. Obtener o crear usuario admin para las órdenes de ejemplo
    try:
        admin_user = User.objects.get(username='admin')
        print(f"👤 Usuario encontrado: {admin_user.username}")
    except User.DoesNotExist:
        print("⚠️  Usuario admin no encontrado. Las órdenes de ejemplo no se crearán.")
        admin_user = None

    # 4. Crear órdenes de ejemplo si existe el usuario
    if admin_user:
        print("\n📋 Creando órdenes de ejemplo...\n")

        # Orden USD con Stripe
        order_usd = Order(
            user=admin_user,
            service=services[0],  # Mezcla Profesional
            currency=Currency.USD,
            payment_gateway=PaymentGateway.STRIPE,
            customer_name=admin_user.get_full_name() or admin_user.username,
            customer_email=admin_user.email or 'admin@producerhub.com',
        )
        order_usd.calculate_totals(services[0])
        order_usd.save()
        print(f"   ✅ Orden USD #{order_usd.order_number}")
        print(f"      Servicio: {order_usd.service.name}")
        print(f"      Total: ${order_usd.total} USD (sin IVA)")
        print(f"      Gateway: Stripe → Payoneer\n")

        # Orden COP con Bold
        order_cop = Order(
            user=admin_user,
            service=services[1],  # Masterización
            currency=Currency.COP,
            payment_gateway=PaymentGateway.BOLD,
            customer_name=admin_user.get_full_name() or admin_user.username,
            customer_email=admin_user.email or 'admin@producerhub.com',
        )
        order_cop.calculate_totals(services[1], exchange_rate.rate)
        order_cop.save()
        print(f"   ✅ Orden COP #{order_cop.order_number}")
        print(f"      Servicio: {order_cop.service.name}")
        print(f"      Subtotal: ${order_cop.subtotal:,.0f} COP")
        print(f"      IVA (19%): ${order_cop.tax_amount:,.0f} COP")
        print(f"      Total: ${order_cop.total:,.0f} COP")
        print(f"      Gateway: Bold\n")

        print(f"✅ {Order.objects.count()} órdenes creadas exitosamente!\n")

    # 5. Resumen final
    print("=" * 50)
    print("📊 RESUMEN DEL SISTEMA DE PAGOS")
    print("=" * 50)
    print(f"Servicios: {Service.objects.count()}")
    print(f"Tasas de cambio: {ExchangeRate.objects.count()}")
    print(f"Órdenes: {Order.objects.count()}")
    print(f"Transacciones: {Transaction.objects.count()}")
    print("\n✅ Sistema de pagos multi-pasarela y multi-moneda listo!")
    print("\n🌐 Accede al admin en: http://localhost:8000/admin")
    print("   Usuario: admin")
    print("   Contraseña: admin123")

if __name__ == '__main__':
    create_sample_data()
