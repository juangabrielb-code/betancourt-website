import { NextResponse } from 'next/server';
import type { User } from '@/types';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Mock delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (email.includes('error')) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  // ADMIN mock
  if (email === 'admin@betancourtaudio.com') {
    const user: User = {
      id: 'admin_001',
      name: 'Sebastian Betancourt',
      email: email,
      role: 'ADMIN',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff',
    };
    return NextResponse.json(user);
  }

  // CLIENT mock
  const user: User = {
    id: 'u_123',
    name: 'Client User',
    email: email,
    role: 'CLIENT',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
  };

  return NextResponse.json(user);
}
