"use client"

import { useActionState } from "react"
import { signIn } from "next-auth/react"
import { signinAction } from "@/lib/actions/auth"

export function SignInForm({
  oauthProviders,
}: {
  oauthProviders: ("github" | "google")[]
}) {
  const [state, formAction, pending] = useActionState(signinAction, { error: "" })

  return (
    <>
      {oauthProviders.length > 0 && (
        <div className="space-y-2">
          {oauthProviders.map((provider) => (
            <form
              key={provider}
              action={async () => {
                await signIn(provider, { redirectTo: "/dashboard" })
              }}
            >
              <button
                type="submit"
                className="w-full rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Sign in with {provider === "github" ? "GitHub" : "Google"}
              </button>
            </form>
          ))}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {state.error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </>
  )
}
