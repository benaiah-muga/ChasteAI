import Link from "next/link"
import { SignUpForm } from "./signup-form"

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-text-primary text-xl font-semibold">Create an account</h1>
        <p className="text-text-tertiary mt-2 text-sm">Get started with ChasteAI</p>
      </div>

      <SignUpForm />

      <div className="mt-6 text-center text-sm">
        <span className="text-text-tertiary">Already have an account? </span>
        <Link href="/signin" className="text-accent font-medium hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  )
}
