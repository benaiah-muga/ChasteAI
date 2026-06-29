import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { getDatabaseClient } from "@chaste-ai/db"
import { authConfig } from "@/auth.config"

const db = getDatabaseClient()

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days default absolute session expiry
  },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true
      if (!user.id) return false

      const { user: userTable } = await import("@chaste-ai/db")
      const [found] = await db
        .select({ status: userTable.status })
        .from(userTable)
        .where(eq(userTable.id, user.id))
        .limit(1)

      if (!found) return false
      if (found.status === "pending" || found.status === "suspended") return false

      return true
    },
    async jwt({ token, user }) {
      const userId = user?.id ?? token.sub
      if (userId) {
        token.sub = userId
        const { user: userTable } = await import("@chaste-ai/db")
        const [found] = await db
          .select({ status: userTable.status })
          .from(userTable)
          .where(eq(userTable.id, userId))
          .limit(1)
        if (found) token.status = found.status
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        ;(session.user as unknown as Record<string, unknown>).id = token.sub
        ;(session.user as unknown as Record<string, unknown>).status = token.status
      }
      return session
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        if (!email || !password) return null

        const { user: userTable } = await import("@chaste-ai/db")
        const [found] = await db.select().from(userTable).where(eq(userTable.email, email)).limit(1)

        if (!found?.password) return null
        const valid = await bcrypt.compare(password, found.password)
        if (!valid) return null
        if (found.status === "pending" || found.status === "suspended") return null

        return {
          id: found.id,
          email: found.email,
          name: found.name,
          image: found.image,
        }
      },
    }),
    ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET ? [GitHub] : []),
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? [Google] : []),
  ],
})
