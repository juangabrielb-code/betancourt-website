/**
 * Auth.js v5 Configuration
 *
 * This file configures NextAuth.js v5 (Auth.js) with Credentials Provider
 * to work with Django backend authentication.
 *
 * Security Features:
 * - Stateless JWT sessions
 * - HttpOnly cookies (configured in middleware)
 * - Secure password validation via backend API
 * - Anti-enumeration protection
 *
 * Related: BET-16 (Setup and Dependencies)
 */

import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

/**
 * Backend API base URL
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Auth.js Configuration
 */
export const config = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "your@email.com"
        },
        password: {
          label: "Password",
          type: "password"
        }
      },
      /**
       * Authorize function - Validates credentials with Django backend
       *
       * @param credentials - User email and password
       * @returns User object if valid, null if invalid
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Call Django login endpoint
          const response = await fetch(`${API_URL}/api/auth/login/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!response.ok) {
            // Return null for invalid credentials (don't throw to prevent enumeration)
            return null
          }

          const data = await response.json()

          // Expected response from Django:
          // {
          //   "user": { "id": "uuid", "email": "user@example.com", "name": "..." },
          //   "access": "jwt-token",
          //   "refresh": "jwt-refresh-token"
          // }

          if (data.user && data.access) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name || data.user.email,
              accessToken: data.access,
              refreshToken: data.refresh,
            }
          }

          return null
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],

  /**
   * Callbacks - Customize JWT and session behavior
   */
  callbacks: {
    /**
     * JWT Callback - Runs when JWT is created or updated
     * Stores access token from Django in the JWT
     */
    async jwt({ token, user }) {
      // Initial sign in - user object is available
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.accessToken = (user as any).accessToken
        token.refreshToken = (user as any).refreshToken
      }

      return token
    },

    /**
     * Session Callback - Exposes data to client
     * Only send necessary data to the frontend
     */
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        // Store access token in session for API calls
        ;(session as any).accessToken = token.accessToken
      }

      return session
    }
  },

  /**
   * Pages - Custom auth pages
   */
  pages: {
    signIn: '/',  // Redirect to home page with auth modal
    error: '/',   // Redirect to home page on error
  },

  /**
   * Session Strategy - Use JWT (stateless)
   */
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60, // 15 minutes (matches backend JWT lifetime)
  },

  /**
   * Security Settings
   */
  secret: process.env.NEXTAUTH_SECRET,

  /**
   * Debug mode (only in development)
   */
  debug: process.env.NODE_ENV === 'development',

} satisfies NextAuthConfig

/**
 * Export auth handlers and helpers
 */
export const { handlers, auth, signIn, signOut } = NextAuth(config)
