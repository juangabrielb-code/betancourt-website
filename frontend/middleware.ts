/**
 * Next.js Middleware with Auth.js v5
 *
 * This middleware protects routes that require authentication.
 * It runs before every request and checks if the user is authenticated.
 *
 * Protected Routes:
 * - /dashboard/* - User dashboard (all authenticated users)
 * - /admin/* - Admin dashboard (admin users only)
 *
 * Security Features:
 * - Session validation on every request
 * - Automatic redirect to home for unauthenticated users
 * - HttpOnly cookies (Secure, SameSite=Lax)
 *
 * Related: BET-16 (Setup), BET-20 (Middleware Implementation)
 */

import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Protected route patterns
 */
const protectedRoutes = ['/dashboard', '/admin']

/**
 * Public routes that should redirect to dashboard if authenticated
 */
const authRoutes = ['/login', '/register']

/**
 * Middleware function
 *
 * @param request - Incoming request
 * @returns Response or redirect
 */
export default auth(async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get session from Auth.js
  const session = await auth()

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Check if current route is an auth route
  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !session) {
    const url = new URL('/', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth routes
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Allow request to proceed
  return NextResponse.next()
})

/**
 * Matcher configuration
 * Specifies which routes this middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
