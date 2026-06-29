import Link from "next/link"
import { Command } from "lucide-react"
import { SignUpForm } from "./signup-form"

export default function SignUpPage() {
  return (
    <div className="flex w-full flex-col items-center text-center">
      <div className="bg-surface-elevated text-accent ring-border mb-6 flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ring-1">
        <Command className="h-6 w-6" />
      </div>

      <h1 className="text-text-primary text-xl font-semibold">Create an account</h1>
      <p className="text-text-tertiary mb-8 mt-2 text-sm">Get started with ChasteAI</p>

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
