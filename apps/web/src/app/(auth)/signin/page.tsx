import Link from "next/link"
import { SignInForm } from "./signin-form"

const availableProviders = [
  ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET ? (["github"] as const) : []),
  ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? (["google"] as const) : []),
]

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-text-primary text-xl font-semibold">Welcome back</h1>
        <p className="text-text-tertiary mt-2 text-sm">Sign in to your workspace</p>
      </div>

      <SignInForm oauthProviders={availableProviders} />

      <div className="mt-6 text-center text-sm">
        <span className="text-text-tertiary">No account? </span>
        <Link href="/signup" className="text-accent font-medium hover:underline">
          Create one
        </Link>
      </div>
    </div>
  )
}
