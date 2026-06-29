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
        <h1 className="text-2xl font-semibold text-[#0f172a]">Team</h1>
        <p className="mt-1 text-sm text-[#64748b]">Manage your workspace members</p>
      </div>

      {pendingUsers.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-[#0f172a]">
            Pending approvals
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              {pendingUsers.length}
            </span>
          </h2>
          <div className="overflow-hidden rounded-lg border border-[#e2e8f0]">
            {pendingUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between border-b border-[#e2e8f0] px-4 py-3 transition-colors last:border-b-0 hover:bg-[#f8fafc]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1f5f9] text-sm font-medium text-[#64748b]">
                    {u.name?.charAt(0)?.toUpperCase() ?? u.email?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0f172a]">{u.name ?? "Unnamed"}</p>
                    <p className="text-xs text-[#64748b]">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModalUser(u)}
                    disabled={approving === u.id}
                    className="rounded-md bg-[#22c55e] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#16a34a] disabled:opacity-50"
                  >
                    {approving === u.id ? "Approving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleDeny(u.id)}
                    disabled={denying === u.id}
                    className="rounded-md border border-[#e2e8f0] px-3 py-1.5 text-xs font-medium text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#ef4444] disabled:opacity-50"
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
        <h2 className="mb-3 text-sm font-semibold text-[#0f172a]">Workspace members</h2>
        <p className="text-sm text-[#64748b]">Member list coming soon</p>
      </div>

      {modalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-[#e2e8f0] bg-white shadow-2xl">
            <div className="border-b border-[#e2e8f0] px-6 py-4">
              <h3 className="text-base font-semibold text-[#0f172a]">Approve user</h3>
              <p className="mt-1 text-sm text-[#64748b]">
                {modalUser.name ?? "Unnamed"} &lt;{modalUser.email}&gt;
              </p>
            </div>
            <div className="space-y-4 px-6 py-4">
              <div>
                <label className="block text-sm font-medium text-[#0f172a]">Workspace</label>
                <select
                  value={selectedWorkspace}
                  onChange={(e) => setSelectedWorkspace(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-[#e2e8f0] px-3 py-2 text-sm focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                >
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0f172a]">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as "admin" | "member")}
                  className="mt-1 block w-full rounded-md border border-[#e2e8f0] px-3 py-2 text-sm focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-[#e2e8f0] px-6 py-4">
              <button
                onClick={() => {
                  setModalUser(null)
                  setError(null)
                }}
                className="rounded-md px-4 py-2 text-sm font-medium text-[#64748b] transition-colors hover:text-[#0f172a]"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={!selectedWorkspace || approving === modalUser.id}
                className="rounded-md bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4f46e5] disabled:opacity-50"
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
