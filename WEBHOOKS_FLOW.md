# Producer Hub - Flujo de Webhooks y Arquitectura de Pagos

## 📋 Resumen del Sistema

Producer Hub implementa un sistema de pagos **multi-pasarela** y **multi-moneda** con las siguientes características:

### Rutas de Pago

1. **Ruta USD (Internacional)**
   - **Pasarela**: Stripe
   - **Destino**: Payoneer
   - **Características**: Sin impuestos, proceso directo

2. **Ruta COP (Colombia)**
   - **Pasarelas**: Bold o Mercado Pago
   - **Características**:
     - Cálculo automático de IVA (19% por defecto)
     - Soporte para retenciones en la fuente
     - Conversión de moneda con historial de tasas

---

## 🔄 Flujo Completo de Pago

### 1. Creación de Orden

```python
# Usuario selecciona un servicio y moneda
service = Service.objects.get(id=service_id)

# Crear orden
order = Order.objects.create(
    user=request.user,
    service=service,
    currency=Currency.COP,  # o Currency.USD
    payment_gateway=PaymentGateway.BOLD,  # según la moneda
    customer_name=request.user.get_full_name(),
    customer_email=request.user.email
)

# Calcular totales (incluye IVA si es COP)
exchange_rate = ExchangeRate.get_latest_rate()
order.calculate_totals(service, exchange_rate)
order.save()
```

**Resultado:**
- Orden creada con estado `PENDING`
- Subtotal, IVA y total calculados
- Tasa de cambio guardada para auditoría

---

### 2. Iniciar Pago con la Pasarela

#### Para Stripe (USD):

```python
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY

# Crear Payment Intent
payment_intent = stripe.PaymentIntent.create(
    amount=int(order.total * 100),  # Stripe usa centavos
    currency='usd',
    metadata={
        'order_number': order.order_number,
        'order_id': str(order.id)
    }
)

# Crear transacción inicial
transaction = Transaction.objects.create(
    order=order,
    external_id=payment_intent.id,
    payment_intent_id=payment_intent.id,
    amount=order.total,
    currency=order.currency,
    payment_gateway=PaymentGateway.STRIPE,
    status=TransactionStatus.PENDING,
    gateway_response=payment_intent  # Guardar respuesta completa
)

# Actualizar estado de la orden
order.status = OrderStatus.PROCESSING
order.save()

# Retornar client_secret al frontend
return {'client_secret': payment_intent.client_secret}
```

#### Para Bold (COP):

```python
import requests

# Crear pago en Bold
bold_response = requests.post(
    'https://api.bold.co/v1/payments',
    headers={'Authorization': f'Bearer {settings.BOLD_API_KEY}'},
    json={
        'amount': int(order.total),
        'currency': 'COP',
        'description': f'Orden {order.order_number}',
        'reference': str(order.id),
        'redirect_url': f'{settings.FRONTEND_URL}/checkout/success',
        'webhook_url': f'{settings.BACKEND_URL}/api/webhooks/bold/'
    }
)

bold_data = bold_response.json()

# Crear transacción
transaction = Transaction.objects.create(
    order=order,
    external_id=bold_data['id'],
    amount=order.total,
    currency=order.currency,
    payment_gateway=PaymentGateway.BOLD,
    status=TransactionStatus.PENDING,
    gateway_response=bold_data
)

order.status = OrderStatus.PROCESSING
order.save()

# Retornar URL de checkout de Bold
return {'checkout_url': bold_data['checkout_url']}
```

---

### 3. Recepción de Webhook

Las pasarelas envían notificaciones cuando el estado del pago cambia. Aquí está cómo manejarlas:

#### Endpoint de Webhook (views.py):

```python
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

@csrf_exempt
def stripe_webhook(request):
    """
    Endpoint para recibir webhooks de Stripe
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

    try:
        # Verificar firma del webhook
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return JsonResponse({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError:
        return JsonResponse({'error': 'Invalid signature'}, status=400)

    # Procesar el evento
    if event.type == 'payment_intent.succeeded':
        payment_intent = event.data.object
        handle_stripe_success(payment_intent, event)
    elif event.type == 'payment_intent.payment_failed':
        payment_intent = event.data.object
        handle_stripe_failure(payment_intent, event)

    return JsonResponse({'status': 'success'})


def handle_stripe_success(payment_intent, event):
    """
    Procesa un pago exitoso de Stripe
    """
    # Buscar transacción por external_id
    transaction = Transaction.objects.get(
        external_id=payment_intent.id
    )

    # Guardar payload del webhook para auditoría
    transaction.webhook_payload = event.to_dict()
    transaction.mark_as_success()  # Esto también actualiza la orden

    # Opcional: Enviar email de confirmación
    send_payment_confirmation_email(transaction.order)


def handle_stripe_failure(payment_intent, event):
    """
    Procesa un pago fallido de Stripe
    """
    transaction = Transaction.objects.get(
        external_id=payment_intent.id
    )

    # Obtener detalles del error
    error = payment_intent.last_payment_error
    error_code = error.code if error else None
    error_message = error.message if error else 'Unknown error'

    # Guardar webhook y marcar como fallida
    transaction.webhook_payload = event.to_dict()
    transaction.mark_as_failed(error_code, error_message)

    # Opcional: Notificar al usuario
    send_payment_failed_email(transaction.order, error_message)
```

#### Webhook de Bold:

```python
@csrf_exempt
def bold_webhook(request):
    """
    Endpoint para recibir webhooks de Bold
    """
    payload = json.loads(request.body)

    # Bold envía el ID de la transacción
    transaction_id = payload.get('id')
    status = payload.get('status')

    try:
        transaction = Transaction.objects.get(external_id=transaction_id)
    except Transaction.DoesNotExist:
        return JsonResponse({'error': 'Transaction not found'}, status=404)

    # Guardar payload del webhook
    transaction.webhook_payload = payload

    # Procesar según el estado
    if status == 'approved':
        transaction.mark_as_success()
    elif status == 'rejected' or status == 'failed':
        error_code = payload.get('error_code')
        error_message = payload.get('error_message')
        transaction.mark_as_failed(error_code, error_message)

    transaction.save()

    return JsonResponse({'status': 'success'})
```

---

## 🔐 Seguridad de Webhooks

### Verificación de Firmas

#### Stripe:
```python
import stripe

def verify_stripe_signature(payload, signature, secret):
    try:
        event = stripe.Webhook.construct_event(
            payload, signature, secret
        )
        return True, event
    except Exception as e:
        return False, str(e)
```

#### Bold:
```python
import hashlib
import hmac

def verify_bold_signature(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(expected_signature, signature)
```

---

## 📊 Diagrama de Flujo

```
[Usuario]
    ↓
[Selecciona Servicio + Moneda]
    ↓
[Backend crea Order + Transaction]
    ↓
    ├─ USD → [Stripe Payment Intent]
    │           ↓
    │       [Frontend muestra Stripe Elements]
    │           ↓
    │       [Usuario completa pago]
    │           ↓
    │       [Stripe envía Webhook]
    │           ↓
    │       [Backend actualiza Transaction → Order]
    │           ↓
    │       [Dinero va a Payoneer]
    │
    └─ COP → [Bold/Mercado Pago Checkout]
                ↓
            [Usuario redirigido a Bold]
                ↓
            [Usuario completa pago]
                ↓
            [Bold envía Webhook]
                ↓
            [Backend actualiza Transaction → Order]
                ↓
            [Dinero procesado con IVA/Retenciones]
```

---

## 🗄️ Modelo de Datos - Relaciones

```
User (Django Auth)
    ↓ (1:N)
Order
    ├─ service (FK → Service)
    ├─ currency (USD/COP)
    ├─ payment_gateway (STRIPE/BOLD/MERCADO_PAGO)
    ├─ subtotal, tax_amount, total
    ├─ exchange_rate (si es COP)
    └─ status (PENDING/PROCESSING/PAID/FAILED/CANCELLED/REFUNDED)
    ↓ (1:N)
Transaction
    ├─ external_id (ID de Stripe/Bold/Mercado Pago)
    ├─ webhook_payload (JSON completo del webhook)
    ├─ gateway_response (JSON de la respuesta original)
    ├─ status (PENDING/PROCESSING/SUCCESS/FAILED)
    └─ amount, currency
```

---

## 🛠️ Configuración de URLs para Webhooks

### urls.py:

```python
from django.urls import path
from payments import views

urlpatterns = [
    # ... otras rutas
    path('api/webhooks/stripe/', views.stripe_webhook, name='stripe-webhook'),
    path('api/webhooks/bold/', views.bold_webhook, name='bold-webhook'),
    path('api/webhooks/mercadopago/', views.mercadopago_webhook, name='mercadopago-webhook'),
]
```

### Configurar en las Pasarelas:

1. **Stripe Dashboard**:
   - Webhooks → Add endpoint
   - URL: `https://tudominio.com/api/webhooks/stripe/`
   - Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`

2. **Bold Dashboard**:
   - Configuración → Webhooks
   - URL: `https://tudominio.com/api/webhooks/bold/`

---

## 🧪 Testing de Webhooks

### Stripe CLI (Desarrollo):

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Reenviar eventos a localhost
stripe listen --forward-to localhost:8000/api/webhooks/stripe/

# Trigger evento de prueba
stripe trigger payment_intent.succeeded
```

### ngrok (Desarrollo Local):

```bash
# Exponer localhost a internet
ngrok http 8000

# Usar la URL de ngrok en las configuraciones de webhook
https://xxxx.ngrok.io/api/webhooks/stripe/
```

---

## 📈 Monitoreo y Auditoría

### Logs Recomendados:

```python
import logging

logger = logging.getLogger('payments')

def handle_stripe_success(payment_intent, event):
    logger.info(
        f"Pago exitoso: Order={order.order_number}, "
        f"Amount={payment_intent.amount/100}, "
        f"Transaction={payment_intent.id}"
    )
    # ... resto del código
```

### Métricas a Monitorear:

- Tasa de éxito de pagos por pasarela
- Tiempo promedio de confirmación de webhook
- Montos procesados por moneda
- Errores más comunes

---

## ✅ Próximos Pasos

1. **Implementar Endpoints de API REST** con Django REST Framework
2. **Crear Vistas de Frontend** para el checkout
3. **Configurar Celery** para tareas asíncronas (emails, reportes)
4. **Implementar Sistema de Reembolsos**
5. **Agregar Notificaciones** (Email, SMS)

---

## 📚 Referencias

- [Stripe Webhooks Docs](https://stripe.com/docs/webhooks)
- [Bold API Docs](https://bold.co/docs/api)
- [Mercado Pago Webhooks](https://www.mercadopago.com.co/developers/es/docs/your-integrations/notifications/webhooks)
