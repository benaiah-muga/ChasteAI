"use client"

import { useState } from "react"
import Link from "next/link"
import type { inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "@/server/api/root"
import { api } from "@/trpc/react"
import { useRouter } from "next/navigation"
import { Plus, Bot, Key, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

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
      color: "bg-info",
    },
    {
      label: "Conversations",
      value: stats.conversationCount,
      href: "/dashboard/agents",
      color: "bg-success",
    },
    {
      label: "Channels",
      value: stats.channelCount,
      href: "/dashboard/agents",
      color: "bg-warning",
    },
    {
      label: "Messages",
      value: stats.messageCount,
      href: "/dashboard/agents",
      color: "bg-accent",
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-text-primary text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-text-tertiary mt-1 text-sm">
          Monitor your customer support infrastructure at a glance.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="border-border bg-surface hover:bg-surface-elevated hover:border-border-hover group rounded-xl border p-5 transition-colors"
          >
            <div className={`mb-3 h-1 w-10 rounded-full ${card.color}`} />
            <p className="text-text-primary mb-1 text-2xl font-bold">{card.value}</p>
            <p className="text-text-secondary text-xs font-medium uppercase tracking-wider">
              {card.label}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Link
              href="/dashboard/agents/new"
              className="text-text-secondary hover:bg-surface-elevated hover:text-text-primary group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors"
            >
              <div className="bg-surface-high group-hover:bg-accent-subtle text-text-muted group-hover:text-accent-text flex h-8 w-8 items-center justify-center rounded transition-colors">
                <Bot className="h-4 w-4" />
              </div>
              <span className="font-medium">Create new agent</span>
            </Link>
            <Link
              href="/dashboard/api-keys"
              className="text-text-secondary hover:bg-surface-elevated hover:text-text-primary group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors"
            >
              <div className="bg-surface-high group-hover:bg-accent-subtle text-text-muted group-hover:text-accent-text flex h-8 w-8 items-center justify-center rounded transition-colors">
                <Key className="h-4 w-4" />
              </div>
              <span className="font-medium">Generate API key</span>
            </Link>
            <Link
              href="/dashboard/documents"
              className="text-text-secondary hover:bg-surface-elevated hover:text-text-primary group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors"
            >
              <div className="bg-surface-high group-hover:bg-accent-subtle text-text-muted group-hover:text-accent-text flex h-8 w-8 items-center justify-center rounded transition-colors">
                <FileText className="h-4 w-4" />
              </div>
              <span className="font-medium">Upload document</span>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-text-muted py-4 text-center text-[13px]">No conversations yet.</p>
            ) : (
              <div className="space-y-1">
                {recent.slice(0, 5).map((conv) => (
                  <div
                    key={conv.id}
                    className="hover:bg-surface-elevated flex items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span
                        className={`inline-block h-2 w-2 shrink-0 rounded-full ${conv.status === "active" ? "bg-success" : "bg-text-muted"}`}
                      />
                      <span className="text-text-secondary truncate font-medium">
                        {conv.agentName}
                      </span>
                    </div>
                    <span className="text-text-muted shrink-0 whitespace-nowrap text-xs">
                      {conv.messageCount} msgs
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Workspaces</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-1 h-3 w-3" />
            {showForm ? "Cancel" : "New"}
          </Button>
        </CardHeader>
        <div className="divide-border border-border mt-2 divide-y border-t">
          {initial.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-text-muted text-[13px]">
                No workspaces yet. Create one to get started.
              </p>
            </div>
          ) : (
            initial.map(({ workspaces: ws }) => (
              <div
                key={ws.id}
                className="hover:bg-surface-elevated flex items-center justify-between px-6 py-4 transition-colors"
              >
                <div>
                  <p className="text-text-primary text-[13px] font-medium">{ws.name}</p>
                  <p className="text-text-tertiary text-xs">{ws.slug}</p>
                </div>
                <span className="text-text-muted font-mono text-xs">
                  {ws.createdAt.toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>

      {showForm && (
        <Card className="border-accent mt-4 border">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor="ws-name"
                  className="text-text-secondary block text-[13px] font-medium"
                >
                  Workspace name
                </label>
                <Input
                  id="ws-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Workspace"
                  required
                />
                <p className="text-text-muted font-mono text-xs">
                  Slug: {name ? generateSlug(name) : "my-workspace"}
                </p>
              </div>
              {createWorkspace.error && (
                <p className="text-danger-text bg-danger-subtle rounded-md px-3 py-2 text-[13px]">
                  {createWorkspace.error.message}
                </p>
              )}
              <div className="flex justify-end">
                <Button type="submit" loading={createWorkspace.isPending}>
                  Create Workspace
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
