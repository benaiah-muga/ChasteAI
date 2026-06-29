"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { approveUserAction, denyUserAction } from "@/lib/actions/admin"

type PendingUser = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  createdAt: string | Date | null
}

type Workspace = {
  id: string
  name: string | null
}

export function TeamClient({
  pendingUsers,
  workspaces,
}: {
  pendingUsers: PendingUser[]
  workspaces: Workspace[]
}) {
  const router = useRouter()
  const [approving, setApproving] = useState<string | null>(null)
  const [denying, setDenying] = useState<string | null>(null)
  const [modalUser, setModalUser] = useState<PendingUser | null>(null)
  const [selectedWorkspace, setSelectedWorkspace] = useState(workspaces[0]?.id ?? "")
  const [selectedRole, setSelectedRole] = useState<"admin" | "member">("member")
  const [error, setError] = useState<string | null>(null)

  async function handleApprove() {
    if (!modalUser || !selectedWorkspace) return
    setApproving(modalUser.id)
    setError(null)
    const result = await approveUserAction({
      userId: modalUser.id,
      workspaceId: selectedWorkspace,
      role: selectedRole,
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
    <div className="space-y-8">
      <div>
        <h1 className="text-text-primary text-2xl font-semibold">Team</h1>
        <p className="text-text-tertiary mt-1 text-sm">Manage your workspace members</p>
      </div>

      {pendingUsers.length > 0 && (
        <div>
          <h2 className="text-text-primary mb-3 text-sm font-semibold">
            Pending approvals
            <span className="bg-warning-subtle text-warning-text ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium">
              {pendingUsers.length}
            </span>
          </h2>
          <div className="border-border overflow-hidden rounded-lg border">
            {pendingUsers.map((u) => (
              <div
                key={u.id}
                className="border-border hover:bg-surface-hover flex items-center justify-between border-b px-4 py-3 transition-colors last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-surface text-text-tertiary flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                    {u.name?.charAt(0)?.toUpperCase() ?? u.email?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-medium">{u.name ?? "Unnamed"}</p>
                    <p className="text-text-tertiary text-xs">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModalUser(u)}
                    disabled={approving === u.id}
                    className="bg-success hover:bg-success/80 rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors disabled:opacity-50"
                  >
                    {approving === u.id ? "Approving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleDeny(u.id)}
                    disabled={denying === u.id}
                    className="border-border text-text-tertiary hover:bg-surface hover:text-danger rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {denying === u.id ? "Denying..." : "Deny"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-text-primary mb-3 text-sm font-semibold">Workspace members</h2>
        <p className="text-text-tertiary text-sm">Member list coming soon</p>
      </div>

      {modalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="border-border bg-surface w-full max-w-md rounded-xl border shadow-2xl">
            <div className="border-border border-b px-6 py-4">
              <h3 className="text-text-primary text-base font-semibold">Approve user</h3>
              <p className="text-text-tertiary mt-1 text-sm">
                {modalUser.name ?? "Unnamed"} &lt;{modalUser.email}&gt;
              </p>
            </div>
            <div className="space-y-4 px-6 py-4">
              <div>
                <label className="text-text-primary block text-sm font-medium">Workspace</label>
                <select
                  value={selectedWorkspace}
                  onChange={(e) => setSelectedWorkspace(e.target.value)}
                  className="border-border bg-surface text-text-primary focus:border-accent focus:ring-accent mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                >
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-text-primary block text-sm font-medium">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as "admin" | "member")}
                  className="border-border bg-surface text-text-primary focus:border-accent focus:ring-accent mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {error && (
                <div
                  role="alert"
                  className="border-danger-border bg-danger-subtle text-danger-text rounded-md border px-3 py-2 text-sm"
                >
                  {error}
                </div>
              )}
            </div>
            <div className="border-border flex items-center justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => {
                  setModalUser(null)
                  setError(null)
                }}
                className="text-text-tertiary hover:text-text-primary rounded-md px-4 py-2 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={!selectedWorkspace || approving === modalUser.id}
                className="bg-accent hover:bg-accent/80 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
              >
                {approving === modalUser.id ? "Approving..." : "Approve & add to workspace"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
