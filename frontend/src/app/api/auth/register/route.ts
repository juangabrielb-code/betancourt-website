import { NextResponse } from 'next/server';
import type { User } from '@/types';

export async function POST(request: Request) {
  const data = await request.json();

  // Mock delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const user: User = {
    id: 'u_new',
    name: data.name,
    email: data.email,
    role: 'CLIENT',
  };

  return NextResponse.json(user);
}
