import { SignUpForm } from "./signup-form"

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Create an account</h1>
        <p className="mt-2 text-sm text-gray-500">
          Get started with ChasteAI
        </p>
      </div>

      <SignUpForm />

      <div className="text-center text-sm">
        <span className="text-gray-500">Already have an account? </span>
        <a href="/signin" className="font-medium underline">
          Sign in
        </a>
      </div>
    </div>
  )
}
