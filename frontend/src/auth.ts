import NextAuth, { DefaultSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
// TODO: Enable these providers when credentials are configured
// import FacebookProvider from "next-auth/providers/facebook"
// import AppleProvider from "next-auth/providers/apple"
// import MicrosoftEntraIDProvider from "next-auth/providers/microsoft-entra-id"

// Django API URL
const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://backend:8000"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role?: string
    } & DefaultSession["user"]
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Database adapter for persisting users and accounts
  adapter: PrismaAdapter(prisma),

  // Configure providers
  providers: [
    // Email/Password Provider (Django Backend)
    CredentialsProvider({
      id: "credentials",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "tu@email.com" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Authenticate against Django API
          const response = await fetch(`${DJANGO_API_URL}/api/auth/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!response.ok) {
            return null
          }

          const data = await response.json()

          // Return user object for Auth.js session
          return {
            id: data.user.id,
            email: data.user.email,
            name: `${data.user.first_name} ${data.user.last_name}`.trim() || data.user.email,
            djangoTokens: data.tokens, // Store Django JWT tokens
          }
        } catch (error) {
          console.error("Django auth error:", error)
          return null
        }
      },
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    // TODO: Enable Facebook when credentials are configured
    // FacebookProvider({
    //   clientId: process.env.AUTH_FACEBOOK_ID!,
    //   clientSecret: process.env.AUTH_FACEBOOK_SECRET!,
    // }),

    // TODO: Enable Apple when credentials are configured
    // AppleProvider({
    //   clientId: process.env.AUTH_APPLE_ID!,
    //   clientSecret: process.env.AUTH_APPLE_SECRET!,
    // }),

    // TODO: Enable Microsoft when credentials are configured
    // MicrosoftEntraIDProvider({
    //   clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
    //   clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
    //   tenantId: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID || "common",
    // }),
  ],

  // Session configuration - using JWT strategy
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // Callbacks for customizing behavior
  callbacks: {
    // JWT callback - runs whenever a JWT is created or updated
    async jwt({ token, user, account, profile }) {
      // On sign in, add user info to token
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email

        // Handle credentials provider (Django users)
        if (account?.provider === "credentials") {
          token.provider = "credentials"
          token.role = "CLIENT" // Django users default to CLIENT
          // Store Django JWT tokens for API calls
          if ((user as any).djangoTokens) {
            token.djangoAccessToken = (user as any).djangoTokens.access
            token.djangoRefreshToken = (user as any).djangoTokens.refresh
          }
        } else if (account) {
          // OAuth providers - fetch role from Prisma database
          token.provider = account.provider
          token.providerAccountId = account.providerAccountId
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: user.id },
              select: { role: true }
            })
            token.role = dbUser?.role || "CLIENT"
          } catch {
            token.role = "CLIENT"
          }
        }
      }

      // Store profile info if available (OAuth)
      if (profile) {
        token.name = profile.name || token.name
        token.email = profile.email || token.email
        token.picture = (profile as any).picture || token.picture
      }

      return token
    },

    // Session callback - runs whenever session is checked
    async session({ session, token }) {
      // Add user ID and role to session
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as string) || "CLIENT"
        // Use token picture if available (from OAuth profile)
        if (token.picture) {
          session.user.image = token.picture as string
        }
      }

      return session
    },

    // Authorization callback - runs on every request
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
      const isOnAdmin = nextUrl.pathname.startsWith("/admin")

      // Protected routes
      if (isOnDashboard || isOnAdmin) {
        if (!isLoggedIn) return false

        // Admin routes require ADMIN role
        if (isOnAdmin && auth.user.role !== "ADMIN") {
          return Response.redirect(new URL("/dashboard", nextUrl))
        }

        return true
      }

      return true
    },
  },

  // Custom pages - only set error page, let signIn use default behavior
  pages: {
    error: "/auth/error",
  },

  // Security options
  secret: process.env.AUTH_SECRET,

  // Enable debug messages in development
  debug: process.env.NODE_ENV === "development",

  // Trust host for Docker/proxy environments
  trustHost: true,
})
