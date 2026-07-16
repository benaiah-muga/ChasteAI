"use client"

import { useActionState } from "react"
import { AlertCircle } from "lucide-react"
import { signupAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signupAction, { error: "" })

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="border-danger bg-danger-subtle text-danger-text flex items-start gap-2 rounded-lg p-3 text-[13px]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="name" className="text-text-secondary block text-[13px] font-medium">
          Name <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <Input id="name" name="name" type="text" autoComplete="name" placeholder="Jane Doe" />
      </div>

      <div className="space-y-1.5">
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

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-text-secondary block text-[13px] font-medium">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="••••••••"
        />
      </div>

      <Button type="submit" loading={pending} className="mt-2 w-full">
        Create Account
      </Button>
    </form>
  )
}
