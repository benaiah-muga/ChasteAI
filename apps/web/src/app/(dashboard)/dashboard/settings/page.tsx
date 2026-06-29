"use client"

import { useState } from "react"
import { api } from "@/trpc/react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter()
  const { data: workspaceList, isLoading } = api.workspace.list.useQuery()
  const utils = api.useUtils()

  const workspace = workspaceList?.[0]?.workspaces
  const settings = (workspace?.settings ?? {}) as Record<string, unknown>

  const [sessionTimeoutEnabled, setSessionTimeoutEnabled] = useState(
    settings.sessionTimeoutEnabled !== false,
  )
  const [idleTimeoutMinutes, setIdleTimeoutMinutes] = useState(
    (settings.idleTimeoutMinutes as number) ?? 60,
  )
  const [maxSessionHours, setMaxSessionHours] = useState(
    (settings.maxSessionHours as number) ?? 168,
  )

  const updateSettings = api.workspace.updateSettings.useMutation({
    onSuccess: () => {
      utils.workspace.list.invalidate()
      utils.workspace.getSettings.invalidate()
      router.refresh()
    },
  })

  function handleSave() {
    if (!workspace) return
    updateSettings.mutate({
      id: workspace.id,
      sessionTimeoutEnabled,
      idleTimeoutMinutes,
      maxSessionHours,
    })
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
    <div className="mx-auto max-w-2xl px-8 py-8">
      <div className="mb-8">
        <h1 className="text-text-primary text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-text-tertiary mt-1 text-sm">Manage your workspace preferences.</p>
      </div>

      <div className="border-border bg-surface space-y-6 rounded-xl border p-6">
        <div>
          <h2 className="text-text-primary mb-1 text-base font-medium">Session Timeout</h2>
          <p className="text-text-tertiary text-sm">
            Automatically sign out inactive users after a period of time.
          </p>
        </div>

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
            <input
              id="idle-timeout"
              type="number"
              min={1}
              max={1440}
              value={idleTimeoutMinutes}
              onChange={(e) => setIdleTimeoutMinutes(Number(e.target.value))}
              disabled={!sessionTimeoutEnabled}
              className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full max-w-[200px] rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:opacity-50"
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
            <input
              id="max-session"
              type="number"
              min={1}
              max={720}
              value={maxSessionHours}
              onChange={(e) => setMaxSessionHours(Number(e.target.value))}
              disabled={!sessionTimeoutEnabled}
              className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full max-w-[200px] rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:opacity-50"
            />
            <p className="text-text-muted mt-1 text-xs">
              Absolute maximum session length regardless of activity (default: 168 / 7 days)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="bg-accent text-accent-text hover:bg-accent-strong inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {updateSettings.isPending ? "Saving..." : "Save changes"}
          </button>
          {updateSettings.isSuccess && (
            <span className="text-success-text text-sm">Settings saved</span>
          )}
          {updateSettings.isError && (
            <span className="text-danger-text text-sm">{updateSettings.error.message}</span>
          )}
        </div>
      </div>
    </div>
  )
}
