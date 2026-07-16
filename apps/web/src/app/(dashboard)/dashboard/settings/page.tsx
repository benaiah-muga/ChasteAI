"use client"

import { useState } from "react"
import { api } from "@/trpc/react"
import { useRouter } from "next/navigation"
import { changePasswordAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SecurityCodesModal } from "@/components/security-codes-modal"

export default function SettingsPage() {
  const router = useRouter()
  const { data: workspace, isLoading } = api.workspace.get.useQuery()
  const { data: settings } = api.workspace.getSettings.useQuery()
  const { data: sessionData } = api.auth.session.useQuery()
  const { data: codesData, refetch: refetchCodes } = api.securityCodes.list.useQuery()
  const utils = api.useUtils()

  const user = sessionData?.user

  const [sessionTimeoutEnabled, setSessionTimeoutEnabled] = useState(
    (settings?.sessionTimeoutEnabled as boolean | undefined) !== false,
  )
  const [idleTimeoutMinutes, setIdleTimeoutMinutes] = useState(
    (settings?.idleTimeoutMinutes as number | undefined) ?? 60,
  )
  const [maxSessionHours, setMaxSessionHours] = useState(
    (settings?.maxSessionHours as number | undefined) ?? 168,
  )

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [showCodesModal, setShowCodesModal] = useState(false)
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([])

  const updateSettings = api.workspace.updateSettings.useMutation({
    onSuccess: () => {
      utils.workspace.get.invalidate()
      utils.workspace.getSettings.invalidate()
      router.refresh()
    },
  })

  const generateMutation = api.securityCodes.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedCodes(data.codes)
      setShowCodesModal(true)
      refetchCodes()
    },
  })

  function handleSaveSession() {
    updateSettings.mutate({
      sessionTimeoutEnabled,
      idleTimeoutMinutes,
      maxSessionHours,
    })
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    if (!currentPassword) {
      setPasswordError("Current password is required")
      return
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    setPasswordLoading(true)
    const result = await changePasswordAction({ currentPassword, newPassword })
    setPasswordLoading(false)

    if ("error" in result && result.error) {
      setPasswordError(result.error)
      return
    }

    setPasswordSuccess(true)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-8 py-8">
        <div className="text-text-muted text-sm">Loading...</div>
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="mx-auto max-w-2xl px-8 py-8">
        <div className="text-text-muted text-sm">No workspace found.</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-text-primary font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Manage your account and workspace preferences.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-surface border-border rounded-lg border p-6">
          <div className="mb-4">
            <h2 className="text-text-primary text-sm font-medium">Account</h2>
            <p className="text-text-muted mt-1 text-xs">
              Manage your account details and password.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-text-secondary mb-1 block text-[13px] font-medium">
                Email
              </label>
              <Input
                type="email"
                value={user?.email ?? ""}
                disabled
                className="max-w-sm opacity-60"
              />
            </div>
            <div>
              <label className="text-text-secondary mb-1 block text-[13px] font-medium">Name</label>
              <Input
                type="text"
                value={user?.name ?? ""}
                disabled
                className="max-w-sm opacity-60"
              />
              <p className="text-text-muted mt-1 text-xs">
                Contact an administrator to change your name.
              </p>
            </div>

            <div className="border-border mt-4 border-t pt-4">
              <h3 className="text-text-primary mb-3 text-sm font-medium">Change password</h3>
              <form onSubmit={handleChangePassword} className="space-y-3">
                {passwordError && (
                  <div className="border-danger bg-danger-subtle text-danger-text rounded-md border p-3 text-[13px]">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="border-success bg-success-subtle text-success-text rounded-md border p-3 text-[13px]">
                    Password updated successfully
                  </div>
                )}
                <div>
                  <label className="text-text-secondary mb-1 block text-[13px] font-medium">
                    Current password
                  </label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="max-w-sm"
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
                    className="max-w-sm"
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
                    className="max-w-sm"
                  />
                </div>
                <Button type="submit" loading={passwordLoading} size="sm">
                  Update password
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="bg-surface border-border rounded-lg border p-6">
          <div className="mb-4">
            <h2 className="text-text-primary text-sm font-medium">Security</h2>
            <p className="text-text-muted mt-1 text-xs">
              Manage security codes for account recovery.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-primary text-sm font-medium">Security codes</p>
                <p className="text-text-muted text-xs">
                  {codesData
                    ? codesData.unused > 0
                      ? `${codesData.unused} unused code${codesData.unused === 1 ? "" : "s"} remaining`
                      : "No unused codes remaining"
                    : "Loading..."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {codesData && codesData.unused > 0 && (
                  <Badge variant="success">{codesData.unused} active</Badge>
                )}
                {codesData && codesData.unused === 0 && <Badge variant="danger">None</Badge>}
              </div>
            </div>

            <p className="text-text-secondary text-[13px]">
              Security codes allow you to recover your account if you forget your password. Each
              code can only be used once.
            </p>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => generateMutation.mutate()}
              loading={generateMutation.isPending}
            >
              Generate new codes
            </Button>
            <p className="text-text-muted text-xs">
              Generating new codes will not invalidate any existing unused codes.
            </p>
          </div>
        </div>

        <div className="bg-surface border-border rounded-lg border p-6">
          <div className="mb-4">
            <h2 className="text-text-primary text-sm font-medium">Session Timeout</h2>
            <p className="text-text-muted mt-1 text-xs">
              Automatically sign out inactive users after a period of time.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={sessionTimeoutEnabled}
                onChange={(e) => setSessionTimeoutEnabled(e.target.checked)}
                className="border-border bg-surface-elevated text-accent focus:ring-accent h-4 w-4 rounded"
              />
              <span className="text-text-primary text-sm font-medium">Enable auto sign-out</span>
            </label>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="idle-timeout"
                  className="text-text-primary mb-1.5 block text-sm font-medium"
                >
                  Idle timeout (minutes)
                </label>
                <Input
                  id="idle-timeout"
                  type="number"
                  min={1}
                  max={1440}
                  value={idleTimeoutMinutes}
                  onChange={(e) => setIdleTimeoutMinutes(Number(e.target.value))}
                  disabled={!sessionTimeoutEnabled}
                  className="max-w-[200px]"
                />
                <p className="text-text-muted mt-1 text-xs">
                  Sign out after this many minutes of inactivity (default: 60)
                </p>
              </div>

              <div>
                <label
                  htmlFor="max-session"
                  className="text-text-primary mb-1.5 block text-sm font-medium"
                >
                  Max session length (hours)
                </label>
                <Input
                  id="max-session"
                  type="number"
                  min={1}
                  max={720}
                  value={maxSessionHours}
                  onChange={(e) => setMaxSessionHours(Number(e.target.value))}
                  disabled={!sessionTimeoutEnabled}
                  className="max-w-[200px]"
                />
                <p className="text-text-muted mt-1 text-xs">
                  Absolute maximum session length regardless of activity (default: 168 / 7 days)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                size="sm"
                onClick={handleSaveSession}
                disabled={updateSettings.isPending}
                loading={updateSettings.isPending}
              >
                Save changes
              </Button>
              {updateSettings.isSuccess && (
                <span className="text-success-text text-sm">Settings saved</span>
              )}
              {updateSettings.isError && (
                <span className="text-danger-text text-sm">{updateSettings.error.message}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCodesModal && generatedCodes.length > 0 && (
        <SecurityCodesModal
          codes={generatedCodes}
          open={true}
          onClose={() => setShowCodesModal(false)}
        />
      )}
    </div>
  )
}
