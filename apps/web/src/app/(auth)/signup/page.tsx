import Link from "next/link"
import { SignUpForm } from "./signup-form"

export default function SignUpPage() {
  return (
    <div className="flex w-full flex-col items-center text-center">
      <div className="bg-accent mb-6 flex h-12 w-12 items-center justify-center rounded-md">
        <span className="text-text-inverse text-xl font-bold">C</span>
      </div>

      <h1 className="text-text-primary font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
        Create an account
      </h1>
      <p className="text-text-muted mb-8 mt-2 text-sm">Get started with ChasteAI</p>

      <SignUpForm />

      <div className="mt-6 text-center text-sm">
        <span className="text-text-muted">Already have an account? </span>
        <Link href="/signin" className="text-accent hover:text-accent/80 font-medium">
          Sign In
        </Link>
      </div>
    </div>
  )
}
