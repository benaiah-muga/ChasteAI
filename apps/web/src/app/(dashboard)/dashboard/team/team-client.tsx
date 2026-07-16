"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { approveUserAction, denyUserAction } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type PendingUser = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  createdAt: string | Date | null
}

export function TeamClient({ pendingUsers }: { pendingUsers: PendingUser[] }) {
  const router = useRouter()
  const [approving, setApproving] = useState<string | null>(null)
  const [denying, setDenying] = useState<string | null>(null)
  const [modalUser, setModalUser] = useState<PendingUser | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleApprove() {
    if (!modalUser) return
    setApproving(modalUser.id)
    setError(null)
    const result = await approveUserAction({
      userId: modalUser.id,
    })
    setApproving(null)
    if ("error" in result) {
      setError(result.error!)
      return
    }
    setModalUser(null)
    router.refresh()
  }

  async function handleDeny(userId: string) {
    setDenying(userId)
    setError(null)
    const result = await denyUserAction(userId)
    setDenying(null)
    if ("error" in result) {
      setError(result.error!)
      return
    }
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-text-primary font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Team
        </h1>
        <p className="text-text-muted mt-1 text-sm">Manage your workspace members</p>
      </div>

      {pendingUsers.length > 0 && (
        <div>
          <h2 className="text-text-primary mb-3 text-sm font-medium">
            Pending approvals <Badge variant="warning">{pendingUsers.length}</Badge>
          </h2>
          <div className="bg-surface border-border overflow-hidden rounded-lg border">
            {pendingUsers.map((u) => (
              <div
                key={u.id}
                className="border-border hover:bg-surface-hover flex items-center justify-between border-b px-4 py-3 transition-colors last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-surface-elevated text-text-tertiary flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                    {u.name?.charAt(0)?.toUpperCase() ?? u.email?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-medium">{u.name ?? "Unnamed"}</p>
                    <p className="text-text-muted text-xs">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="xs"
                    onClick={() => setModalUser(u)}
                    disabled={approving === u.id}
                    className="bg-success hover:bg-success/80 text-white"
                  >
                    {approving === u.id ? "Approving..." : "Approve"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => handleDeny(u.id)}
                    disabled={denying === u.id}
                  >
                    {denying === u.id ? "Denying..." : "Deny"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-text-primary mb-3 text-sm font-medium">Workspace members</h2>
        <p className="text-text-muted text-sm">Member list coming soon</p>
      </div>

      {modalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface border-border w-full max-w-md rounded-lg border shadow-2xl">
            <div className="border-border border-b px-6 py-4">
              <h3 className="text-text-primary text-base font-semibold">Approve user</h3>
              <p className="text-text-muted mt-1 text-sm">
                {modalUser.name ?? "Unnamed"} &lt;{modalUser.email}&gt;
              </p>
            </div>
            {error && (
              <div className="px-6 pt-4">
                <div
                  role="alert"
                  className="border-danger bg-danger-subtle text-danger-text rounded-md border px-3 py-2 text-sm"
                >
                  {error}
                </div>
              </div>
            )}
            <div className="border-border flex items-center justify-end gap-3 border-t px-6 py-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setModalUser(null)
                  setError(null)
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={approving === modalUser.id}
                loading={approving === modalUser.id}
              >
                {approving === modalUser.id ? "Approving..." : "Approve"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
