import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Authentication Error</h1>
        <p className="mt-2 text-gray-500">
          Something went wrong. Please try again.
        </p>
        <Link
          href="/signin"
          className="mt-4 inline-block text-sm font-medium underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
