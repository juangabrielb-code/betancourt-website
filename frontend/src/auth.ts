import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || "CLIENT"
      }
      if (account?.provider === "credentials") {
        token.provider = "credentials"
      } else if (account) {
        token.provider = account.provider
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user?.id },
            select: { role: true },
          })
          token.role = dbUser?.role || "CLIENT"
        } catch {
          token.role = "CLIENT"
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = (token.role as string) || "CLIENT"
      }
      return session
    },
  },
})
