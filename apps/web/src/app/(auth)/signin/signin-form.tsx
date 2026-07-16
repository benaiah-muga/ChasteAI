"use client"

import { useState } from "react"
import { useActionState } from "react"
import { signIn } from "next-auth/react"
import { AlertCircle, KeyRound, ArrowLeft } from "lucide-react"
import { signinAction, verifySecurityCodeAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SignInForm({ oauthProviders }: { oauthProviders: ("github" | "google")[] }) {
  const [mode, setMode] = useState<"password" | "security-code">("password")
  const [pwState, pwFormAction, pwPending] = useActionState(signinAction, { error: "" })
  const [scState, scFormAction, scPending] = useActionState(verifySecurityCodeAction, { error: "" })

  const state = mode === "password" ? pwState : scState
  const formAction = mode === "password" ? pwFormAction : scFormAction
  const pending = mode === "password" ? pwPending : scPending

  return (
    <>
      {oauthProviders.length > 0 && mode === "password" && (
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
              <span className="bg-bg text-text-muted px-2">or continue with</span>
            </div>
          </div>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="border-danger bg-danger-subtle text-danger-text flex items-start gap-2 rounded-lg p-3 text-[13px]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="signin-email"
            className="text-text-secondary block text-[13px] font-medium"
          >
            Email
          </label>
          <Input
            id="signin-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="name@example.com"
          />
        </div>

        {mode === "password" ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-text-secondary block text-[13px] font-medium"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setMode("security-code")}
                className="text-text-muted hover:text-text-primary flex items-center gap-1 text-xs hover:underline"
              >
                <KeyRound className="h-3 w-3" />
                Use a security code
              </button>
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
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="security-code"
                className="text-text-secondary block text-[13px] font-medium"
              >
                Security code
              </label>
              <button
                type="button"
                onClick={() => setMode("password")}
                className="text-text-muted hover:text-text-primary flex items-center gap-1 text-xs hover:underline"
              >
                <ArrowLeft className="h-3 w-3" />
                Use password
              </button>
            </div>
            <Input
              id="security-code"
              name="code"
              type="text"
              required
              autoComplete="off"
              placeholder="XXXX-XXXX"
              className="font-mono tracking-wider"
            />
            <p className="text-text-muted text-xs">
              Enter one of your unused security codes to sign in.
            </p>
          </div>
        )}

        <Button type="submit" loading={pending} className="mt-2 w-full">
          Sign In
        </Button>
      </form>
    </>
  )
}
