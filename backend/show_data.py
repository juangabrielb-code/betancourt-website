"""
Display payment system data
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from payments.models import Service, Order, Transaction, ExchangeRate

print("\n" + "="*60)
print("📊 PRODUCER HUB - SISTEMA DE PAGOS")
print("="*60)

print(f"\n🎵 SERVICIOS ({Service.objects.count()}):")
for s in Service.objects.all():
    print(f"   • {s.name}")
    print(f"     USD: ${s.base_price_usd} | COP: ${s.base_price_cop:,.0f}")
    print(f"     IVA: {s.iva_percentage}%")

print(f"\n📋 ÓRDENES ({Order.objects.count()}):")
for o in Order.objects.all():
    print(f"   • {o.order_number}")
    print(f"     Cliente: {o.customer_name}")
    print(f"     Servicio: {o.service.name}")
    print(f"     Moneda: {o.currency}")
    if o.currency == 'COP':
        print(f"     Subtotal: ${o.subtotal:,.0f} COP")
        print(f"     IVA: ${o.tax_amount:,.0f} COP")
        print(f"     Total: ${o.total:,.0f} COP")
    else:
        print(f"     Total: ${o.total} USD")
    print(f"     Gateway: {o.payment_gateway}")
    print(f"     Estado: {o.get_status_display()}")

print(f"\n💱 TASAS DE CAMBIO ({ExchangeRate.objects.count()}):")
for e in ExchangeRate.objects.all():
    print(f"   • {e.from_currency}/{e.to_currency}: {e.rate}")
    print(f"     Fuente: {e.source}")
    print(f"     Fecha: {e.effective_date.strftime('%Y-%m-%d %H:%M')}")

print(f"\n💳 TRANSACCIONES ({Transaction.objects.count()}):")
if Transaction.objects.count() == 0:
    print("   (No hay transacciones aún - se crean cuando se procesan pagos)")
else:
    for t in Transaction.objects.all():
        print(f"   • {t.external_id}")
        print(f"     Orden: {t.order.order_number}")
        print(f"     Monto: ${t.amount} {t.currency}")
        print(f"     Estado: {t.get_status_display()}")

print("\n" + "="*60)
print("✅ Sistema de pagos multi-pasarela y multi-moneda operativo")
print("="*60)
print("\n🌐 Acceso:")
print("   Admin: http://localhost:8000/admin")
print("   Usuario: admin")
print("   Contraseña: admin123")
print("\n📖 Documentación: WEBHOOKS_FLOW.md")
print("="*60 + "\n")
