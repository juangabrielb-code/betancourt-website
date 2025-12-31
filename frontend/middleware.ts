/**
 * Next.js Middleware with Auth.js v5
 *
 * This middleware protects routes that require authentication.
 * It runs before every request and checks if the user is authenticated.
 *
 * Protected Routes:
 * - /dashboard/* - User dashboard (all authenticated users)
 * - /admin/* - Admin dashboard (admin users only)
 */

import { auth } from "./src/auth"
import { NextResponse } from "next/server"

/**
 * Protected route patterns
 */
const protectedRoutes = ['/dashboard', '/admin']

/**
 * Middleware using Auth.js v5 pattern
 * Session is available via auth parameter
 */
export default auth((request) => {
  const { pathname } = request.nextUrl

  // Get session from the auth wrapper (request.auth)
  const session = request.auth

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !session) {
    const url = new URL('/', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // Check admin routes
  if (pathname.startsWith('/admin') && session?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Allow request to proceed
  return NextResponse.next()
})

/**
 * Matcher configuration
 * Only run middleware on protected routes for performance
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
}
