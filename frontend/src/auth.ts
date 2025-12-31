import NextAuth, { DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
// TODO: Enable these providers when credentials are configured
// import FacebookProvider from "next-auth/providers/facebook"
// import AppleProvider from "next-auth/providers/apple"
// import MicrosoftEntraIDProvider from "next-auth/providers/microsoft-entra-id"
import { prisma } from "@/lib/prisma"

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
  // Configure Prisma adapter for database sessions
  adapter: PrismaAdapter(prisma),

  // Configure OAuth providers (only enabled providers with valid credentials)
  providers: [
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
    async jwt({ token, user, account }) {
      // On sign in, add user ID and account info to token
      if (user) {
        token.id = user.id
        token.role = "CLIENT" // Default role
      }

      // Store OAuth account info
      if (account) {
        token.provider = account.provider
        token.providerAccountId = account.providerAccountId
      }

      return token
    },

    // Session callback - runs whenever session is checked
    async session({ session, token }) {
      // Add user ID and role to session
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
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

  // Custom pages
  pages: {
    signIn: "/", // Redirect to home page for sign in
    error: "/", // Redirect to home page on error
  },

  // Security options
  secret: process.env.AUTH_SECRET,

  // Enable debug messages in development
  debug: process.env.NODE_ENV === "development",

  // Cookie configuration
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
})
