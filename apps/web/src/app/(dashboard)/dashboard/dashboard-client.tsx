"use client"

import { useState } from "react"
import Link from "next/link"
import type { inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "@/server/api/root"
import { api } from "@/trpc/react"
import { useRouter } from "next/navigation"

type RouterOutput = inferRouterOutputs<AppRouter>

type WorkspaceWithMembership = RouterOutput["workspace"]["list"][number]
type Stats = RouterOutput["dashboard"]["stats"]
type RecentConversation = RouterOutput["dashboard"]["recentConversations"][number]

export function DashboardClient({
  workspaces: initial,
  stats: initialStats,
  recentConversations: initialRecent,
}: {
  workspaces: WorkspaceWithMembership[]
  stats: Stats
  recentConversations: RecentConversation[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const router = useRouter()
  const utils = api.useUtils()

  const { data: stats } = api.dashboard.stats.useQuery(undefined, {
    initialData: initialStats,
  })
  const { data: recent } = api.dashboard.recentConversations.useQuery(undefined, {
    initialData: initialRecent,
  })

  const createWorkspace = api.workspace.create.useMutation({
    onSuccess: () => {
      utils.workspace.list.invalidate()
      utils.dashboard.stats.invalidate()
      setShowForm(false)
      setName("")
      router.refresh()
    },
  })

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return
    createWorkspace.mutate({ name, slug: generateSlug(name) })
  }

  const statCards = [
    {
      label: "Agents",
      value: stats.agentCount,
      href: "/dashboard/agents",
      color: "bg-[#eef2ff] text-[#6366f1]",
    },
    {
      label: "Conversations",
      value: stats.conversationCount,
      href: "/dashboard/agents",
      color: "bg-[#f0fdf4] text-[#16a34a]",
    },
    {
      label: "Channels",
      value: stats.channelCount,
      href: "/dashboard/agents",
      color: "bg-[#fffbeb] text-[#d97706]",
    },
    {
      label: "Messages",
      value: stats.messageCount,
      href: "/dashboard/agents",
      color: "bg-[#f1f5f9] text-[#64748b]",
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[#0f172a]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Overview of your customer support infrastructure.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-[#e2e8f0] bg-white p-5 transition-shadow hover:shadow-sm"
          >
            <div
              className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}
            >
              <span className="text-lg font-bold">{card.value}</span>
            </div>
            <p className="text-sm font-medium text-[#0f172a]">
              {card.value} {card.label.toLowerCase()}
            </p>
          </Link>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-[#0f172a]">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              href="/dashboard/agents/new"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#64748b] transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a]"
            >
              <svg
                className="h-4 w-4 text-[#6366f1]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create new agent
            </Link>
            <Link
              href="/dashboard/api-keys"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#64748b] transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a]"
            >
              <svg
                className="h-4 w-4 text-[#6366f1]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
                />
              </svg>
              Generate API key
            </Link>
            <Link
              href="/dashboard/documents"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#64748b] transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a]"
            >
              <svg
                className="h-4 w-4 text-[#6366f1]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
              Upload document
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-[#e2e8f0] bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-[#0f172a]">Recent Conversations</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-[#94a3b8]">No conversations yet.</p>
          ) : (
            <div className="space-y-2">
              {recent.slice(0, 5).map((conv) => (
                <div key={conv.id} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${conv.status === "active" ? "bg-[#22c55e]" : "bg-[#94a3b8]"}`}
                  />
                  <span className="flex-1 truncate text-[#64748b]">{conv.agentName}</span>
                  <span className="text-xs text-[#94a3b8]">{conv.messageCount} msgs</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[#e2e8f0] bg-white">
        <div className="border-b border-[#e2e8f0] px-6 py-4">
          <h2 className="text-sm font-semibold text-[#0f172a]">Workspaces</h2>
        </div>
        <div className="divide-y divide-[#e2e8f0]">
          {initial.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-[#94a3b8]">
                No workspaces yet. Create one to get started.
              </p>
            </div>
          ) : (
            initial.map(({ workspaces: ws }) => (
              <div key={ws.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-[#0f172a]">{ws.name}</p>
                  <p className="text-xs text-[#94a3b8]">{ws.slug}</p>
                </div>
                <span className="text-xs text-[#94a3b8]">{ws.createdAt.toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-[#e2e8f0] px-6 py-3">
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs font-medium text-[#6366f1] hover:text-[#4f46e5]"
          >
            {showForm ? "Cancel" : "+ Create workspace"}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 rounded-xl border border-[#e2e8f0] bg-white p-6"
        >
          <div className="mb-4">
            <label htmlFor="ws-name" className="mb-1.5 block text-sm font-medium text-[#0f172a]">
              Workspace name
            </label>
            <input
              id="ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
              placeholder="My Workspace"
              required
            />
            <p className="mt-1 text-xs text-[#94a3b8]">
              Slug: {name ? generateSlug(name) : "my-workspace"}
            </p>
          </div>
          {createWorkspace.error && (
            <p className="mb-3 text-sm text-[#ef4444]">{createWorkspace.error.message}</p>
          )}
          <button
            type="submit"
            disabled={createWorkspace.isPending}
            className="rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4f46e5] disabled:opacity-50"
          >
            {createWorkspace.isPending ? "Creating..." : "Create"}
          </button>
        </form>
      )}
    </div>
  )
}
