import Link from "next/link"

export default function PendingApprovalPage() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-950">
        <span className="text-2xl text-amber-400">🕐</span>
      </div>

      <div>
        <h1 className="text-lg font-semibold text-white">Account pending approval</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-neutral-400">
          Your account has been created and is waiting for an admin to review your request. You will
          receive access once approved.
        </p>
      </div>

      <Link
        href="/signin"
        className="rounded-lg border border-neutral-700 px-5 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
      >
        Back to sign in
      </Link>
    </div>
  )
}
