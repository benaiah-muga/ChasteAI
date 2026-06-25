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
  session: { strategy: "jwt" },
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
        const [found] = await db
          .select()
          .from(userTable)
          .where(eq(userTable.email, email))
          .limit(1)

        if (!found?.password) return null
        const valid = await bcrypt.compare(password, found.password)
        if (!valid) return null

        return {
          id: found.id,
          email: found.email,
          name: found.name,
          image: found.image,
        }
      },
    }),
    ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
      ? [GitHub]
      : []),
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [Google]
      : []),
  ],
})
