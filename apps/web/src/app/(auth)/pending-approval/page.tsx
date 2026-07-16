import Link from "next/link"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PendingApprovalPage() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="bg-warning-subtle ring-warning-border flex h-12 w-12 items-center justify-center rounded-full ring-1">
        <Clock className="text-warning-text h-6 w-6" />
      </div>

      <div>
        <h1 className="text-text-primary font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Account pending approval
        </h1>
        <p className="text-text-muted mt-3 max-w-sm text-sm leading-relaxed">
          Your account has been created and is waiting for an admin to review your request. You will
          receive access once approved.
        </p>
      </div>

      <Button asChild variant="secondary">
        <Link href="/signin">Back to sign in</Link>
      </Button>
    </div>
  )
}
