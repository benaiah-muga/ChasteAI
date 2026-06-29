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
      if (isLoggedIn && (auth?.user as { status?: string } | undefined)?.status === "suspended") {
        return Response.redirect(new URL("/signin", nextUrl.origin))
      }
      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
