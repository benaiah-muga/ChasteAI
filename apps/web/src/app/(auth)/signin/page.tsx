import { SignInForm } from "./signin-form"

const availableProviders = [
  ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
    ? (["github"] as const)
    : []),
  ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
    ? (["google"] as const)
    : []),
]

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Sign in to ChasteAI</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter your email below to sign in
        </p>
      </div>

      <SignInForm oauthProviders={availableProviders} />

      <div className="text-center text-sm">
        <span className="text-gray-500">No account? </span>
        <a href="/signup" className="font-medium underline">
          Sign up
        </a>
      </div>
    </div>
  )
}
