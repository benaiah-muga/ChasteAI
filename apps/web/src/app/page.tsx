import Link from "next/link"
import { Command, ArrowRight } from "lucide-react"
import { auth } from "@/auth"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const session = await auth()

  return (
    <div className="bg-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Subtle background effect */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative z-10 flex w-full max-w-[440px] flex-col items-center px-6 text-center">
        <div className="bg-surface-elevated text-accent ring-border mb-6 flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ring-1">
          <Command className="h-6 w-6" />
        </div>

        <h1 className="text-text-primary mb-2 text-2xl font-medium tracking-tight">ChasteAI</h1>
        <p className="text-text-tertiary mb-10 max-w-[320px] text-sm">
          Open-source AI customer support infrastructure platform
        </p>

        <div className="w-full space-y-6">
          <Button asChild size="lg" className="w-full font-medium shadow-md">
            <Link href="/setup">
              Initialize Workspace
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="border-border w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-bg text-text-muted px-2">or</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            {session?.user ? (
              <Link
                href="/dashboard"
                className="text-text-secondary hover:text-text-primary text-[13px] transition-colors"
              >
                Already configured? &rarr;{" "}
                <span className="text-text-primary font-medium">Open Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/signin"
                className="text-text-secondary hover:text-text-primary text-[13px] transition-colors"
              >
                Already configured? &rarr;{" "}
                <span className="text-text-primary font-medium">Sign In</span>
              </Link>
            )}
          </div>
        </div>

        <div className="text-text-muted mt-16 flex flex-col items-center gap-1 text-[11px]">
          <span>Version 0.1.0 &middot; MIT License</span>
          <div className="flex items-center gap-2">
            <a href="#" className="hover:text-text-secondary transition-colors">
              Documentation
            </a>
            <span>&middot;</span>
            <a href="#" className="hover:text-text-secondary transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
