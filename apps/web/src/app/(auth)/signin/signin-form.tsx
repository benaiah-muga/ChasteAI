"use client"

import { useActionState } from "react"
import { signIn } from "next-auth/react"
import { AlertCircle } from "lucide-react"
import { signinAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SignInForm({ oauthProviders }: { oauthProviders: ("github" | "google")[] }) {
  const [state, formAction, pending] = useActionState(signinAction, { error: "" })

  return (
    <>
      {oauthProviders.length > 0 && (
        <div className="mb-6 space-y-2">
          {oauthProviders.map((provider) => (
            <form
              key={provider}
              action={async () => {
                await signIn(provider, { redirectTo: "/dashboard" })
              }}
            >
              <Button type="submit" variant="secondary" className="w-full">
                Sign in with {provider === "github" ? "GitHub" : "Google"}
              </Button>
            </form>
          ))}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="border-border w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface-elevated text-text-muted px-2">or continue with</span>
            </div>
          </div>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="border-danger-border bg-danger-subtle text-danger-text flex items-start gap-2 rounded-md border px-3 py-2 text-[13px]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="email" className="text-text-secondary block text-[13px] font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="name@example.com"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-text-secondary block text-[13px] font-medium">
              Password
            </label>
            <a
              href="/forgot-password"
              className="text-text-muted hover:text-text-primary text-xs hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" loading={pending} className="mt-2 w-full">
          Sign In
        </Button>
      </form>
    </>
  )
}
