/**
 * Type definitions for Auth.js (NextAuth v5)
 *
 * This file extends the default NextAuth types to include
 * custom properties from our Django backend.
 *
 * Related: BET-16 (Setup and Dependencies)
 */

import { DefaultSession } from "next-auth"

/**
 * Extend the default User type
 */
declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    accessToken?: string
    refreshToken?: string
  }

  /**
   * Extend the default Session type
   */
  interface Session {
    user: {
      id: string
      email: string
      name: string
    } & DefaultSession["user"]
    accessToken?: string
  }
}

/**
 * Extend the default JWT type
 */
declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name: string
    accessToken?: string
    refreshToken?: string
  }
}
