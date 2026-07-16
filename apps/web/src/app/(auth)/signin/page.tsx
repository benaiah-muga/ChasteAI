import Link from "next/link"
import { SignInForm } from "./signin-form"

const availableProviders = [
  ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET ? (["github"] as const) : []),
  ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? (["google"] as const) : []),
]

export default function SignInPage() {
  return (
    <div className="flex w-full flex-col items-center text-center">
      <div className="bg-accent mb-6 flex h-12 w-12 items-center justify-center rounded-md">
        <span className="text-text-inverse text-xl font-bold">C</span>
      </div>

      <h1 className="text-text-primary font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
        Welcome back
      </h1>
      <p className="text-text-muted mb-8 mt-2 text-sm">Sign in to your workspace</p>

      <SignInForm oauthProviders={availableProviders} />

      <div className="mt-6 text-center text-sm">
        <span className="text-text-muted">No account? </span>
        <Link href="/signup" className="text-accent hover:text-accent/80 font-medium">
          Create one
        </Link>
      </div>
    </div>
  )
}
