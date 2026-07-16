"use client"

import { useState, useCallback, useEffect } from "react"
import { Lock } from "lucide-react"
import { changePasswordAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ChangePasswordModalProps = {
  open: boolean
  onComplete: () => void
}

export function ChangePasswordModal({ open, onComplete }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") e.preventDefault()
  }, [])

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, handleKeyDown])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!currentPassword) {
      setError("Enter your current password or security code")
      return
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    const result = await changePasswordAction({ currentPassword, newPassword })
    setLoading(false)

    if ("error" in result && result.error) {
      setError(result.error)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      onComplete()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" />
      <div className="bg-surface border-border relative z-10 mx-4 w-full max-w-md rounded-xl border shadow-lg">
        <div className="p-8 pb-4 text-center">
          <div className="bg-accent-subtle mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Lock className="text-accent h-6 w-6" />
          </div>
          <h2 className="text-text-primary text-lg font-semibold">Change your password</h2>
          <p className="text-text-secondary mt-1 text-sm">
            You signed in with a security code. Please set a new password to secure your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8">
          {error && (
            <div className="border-danger-border bg-danger-subtle text-danger-text mb-4 rounded-md border p-3 text-[13px]">
              {error}
            </div>
          )}

          {success ? (
            <div className="border-success-border bg-success-subtle text-success-text rounded-md border p-3 text-center text-[13px]">
              Password updated successfully
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-text-secondary mb-1 block text-[13px] font-medium">
                  Current password or security code
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password or unused security code"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-text-secondary mb-1 block text-[13px] font-medium">
                  New password
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label className="text-text-secondary mb-1 block text-[13px] font-medium">
                  Confirm new password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </div>
            </div>
          )}

          {!success && (
            <div className="mt-6 flex justify-end">
              <Button type="submit" loading={loading}>
                Update password
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
