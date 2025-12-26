/**
 * Auth.js v5 Route Handler
 *
 * This file exports the Auth.js HTTP handlers for authentication.
 * It handles all auth-related API routes under /api/auth/*
 *
 * Available endpoints:
 * - GET  /api/auth/session - Get current session
 * - POST /api/auth/signin - Sign in
 * - POST /api/auth/signout - Sign out
 * - GET  /api/auth/csrf - Get CSRF token
 * - GET  /api/auth/providers - Get configured providers
 *
 * Related: BET-16 (Setup and Dependencies)
 */

import { handlers } from "@/auth"

export const { GET, POST } = handlers
