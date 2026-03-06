import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"

const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const response = await fetch(`${DJANGO_API_URL}/api/auth/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!response.ok) return null

          const data = await response.json()

          if (data.user && data.access) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: `${data.user.first_name} ${data.user.last_name}`.trim() || data.user.email,
              accessToken: data.access,
              refreshToken: data.refresh,
            }
          }

          return null
        } catch {
          return null
        }
      },
    }),
  ],
  pages: {
    error: "/auth/error",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
      const isOnAdmin = nextUrl.pathname.startsWith("/admin")

      if (isOnAdmin) {
        if (!isLoggedIn || (auth.user as any)?.role !== "ADMIN") {
          return Response.redirect(new URL("/", nextUrl))
        }
        return true
      }

      if (isOnDashboard) {
        if (!isLoggedIn) return false
        return true
      }

      return true
    },
  },
} satisfies NextAuthConfig
