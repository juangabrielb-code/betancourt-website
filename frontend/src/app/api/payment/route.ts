import { NextResponse } from 'next/server';
import type { Currency, CreateOrderResponse } from '@/types';

export async function POST(request: Request) {
  const { serviceId, currency } = await request.json();

  // Mock delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const orderId = `ORD-${Math.floor(Math.random() * 10000)}`;

  if (currency === 'USD') {
    const response: CreateOrderResponse = {
      orderId,
      clientSecret: 'pi_mock_secret_12345_stripe_intent'
    };
    return NextResponse.json(response);
  } else {
    const response: CreateOrderResponse = {
      orderId,
      checkoutUrl: 'https://checkout.bold.co/mock-payment-link'
    };
    return NextResponse.json(response);
  }
}
