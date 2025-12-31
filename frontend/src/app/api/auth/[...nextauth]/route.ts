/**
 * Auth.js API Route Handler
 *
 * This handles all authentication requests including:
 * - OAuth provider redirects (Google, Facebook, Apple, Microsoft)
 * - Session management
 * - Sign in/out operations
 *
 * Routes handled:
 * - GET  /api/auth/signin
 * - POST /api/auth/signin/:provider
 * - GET  /api/auth/callback/:provider
 * - GET  /api/auth/signout
 * - POST /api/auth/signout
 * - GET  /api/auth/session
 * - GET  /api/auth/csrf
 * - GET  /api/auth/providers
 */

import { handlers } from "@/auth"

export const { GET, POST } = handlers
