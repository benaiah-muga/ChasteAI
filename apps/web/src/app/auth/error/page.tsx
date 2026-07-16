import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <div className="bg-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]" />

      <div className="relative z-10 text-center">
        <div className="bg-accent mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-md">
          <span className="text-text-inverse text-xl font-bold">C</span>
        </div>

        <h1 className="text-text-primary font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Authentication Error
        </h1>
        <p className="text-text-muted mt-2 text-sm">Something went wrong. Please try again.</p>
        <Link
          href="/signin"
          className="text-accent hover:text-accent/80 mt-4 inline-block text-sm font-medium"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
