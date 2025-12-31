import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

export async function middleware(request: NextRequest) {
  // Get session using Auth.js auth() function
  const session = await auth();

  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  // Admin-only routes
  const isAdminRoute = pathname.startsWith('/admin');

  // If trying to access protected route without authentication
  if (isProtectedRoute && !session) {
    const url = new URL('/', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // If trying to access admin route without admin role
  if (isAdminRoute && session?.user?.role !== 'ADMIN') {
    // Redirect to dashboard if authenticated but not admin
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Redirect to home if not authenticated
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};
