import Link from "next/link"
import { Command } from "lucide-react"
import { SignInForm } from "./signin-form"

const availableProviders = [
  ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET ? (["github"] as const) : []),
  ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? (["google"] as const) : []),
]

export default function SignInPage() {
  return (
    <div className="flex w-full flex-col items-center text-center">
      <div className="bg-surface-elevated text-accent ring-border mb-6 flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ring-1">
        <Command className="h-6 w-6" />
      </div>

      <h1 className="text-text-primary text-xl font-semibold">Welcome back</h1>
      <p className="text-text-tertiary mt-2 mb-8 text-sm">Sign in to your workspace</p>

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
