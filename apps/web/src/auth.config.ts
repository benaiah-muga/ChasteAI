import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const publicPaths = ["/signin", "/signup", "/", "/auth/error", "/setup", "/pending-approval"]
      const isLoggedIn = !!auth?.user
      const isPublic = publicPaths.includes(nextUrl.pathname)
      if (!isLoggedIn && !isPublic) {
        return Response.redirect(new URL("/signin", nextUrl.origin))
      }
      return true
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  providers: [],
} satisfies NextAuthConfig
