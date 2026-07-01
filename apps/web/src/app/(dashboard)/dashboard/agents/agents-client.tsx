"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Bot, Plus, Search, LayoutGrid, List, Trash2, ExternalLink } from "lucide-react"
import { api } from "@/trpc/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Agent = {
  id: string
  workspaceId: string
  name: string
  description: string | null
  systemPrompt: string | null
  status: string
  providerConfig: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

type Workspace = {
  id: string
  name: string
  slug: string
}

const statusVariant: Record<string, "success" | "warning" | "neutral"> = {
  active: "success",
  draft: "warning",
  inactive: "neutral",
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getProviderLabel(config: Record<string, unknown>) {
  const provider = (config.provider as string) ?? "openai"
  const model = (config.model as string) ?? "gpt-4o"
  const label =
    provider === "openai"
      ? "OpenAI"
      : provider === "openai-compatible"
        ? "OpenAI Compatible"
        : provider
  return `${label} · ${model}`
}

export function AgentsClient({
  agents: initial,
  workspaces: _workspaces,
}: {
  agents: Agent[]
  workspaces: Workspace[]
}) {
  const router = useRouter()
  const utils = api.useUtils()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const deleteAgent = api.agent.delete.useMutation({
    onSuccess: () => {
      utils.agent.list.invalidate()
      router.refresh()
      setDeleting(null)
    },
    onError: () => {
      setDeleting(null)
    },
  })

  function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this agent?")) {
      setDeleting(id)
      deleteAgent.mutate({ id })
    }
  }

  const filtered = initial.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-text-primary text-2xl font-semibold tracking-tight">Agents</h1>
          <p className="text-text-tertiary mt-1 text-sm">
            Configure AI agents that handle conversations across channels.
          </p>
        </div>
        <Link href="/dashboard/agents/new">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            New agent
          </Button>
        </Link>
      </div>

      {initial.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs">
            <Search className="text-text-muted absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="bg-surface border-border inline-flex rounded-lg border p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-surface-active text-text-primary"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "list"
                  ? "bg-surface-active text-text-primary"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {initial.length === 0 ? (
        <div className="border-border bg-surface flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-16">
          <div className="bg-accent-subtle text-accent mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Bot className="h-6 w-6" />
          </div>
          <h3 className="text-text-primary text-base font-semibold">No agents yet</h3>
          <p className="text-text-tertiary mt-1 text-sm">
            Create your first AI agent to start handling conversations.
          </p>
          <Link href="/dashboard/agents/new" className="mt-4">
            <Button>
              <Plus className="mr-1.5 h-4 w-4" />
              Create your first agent
            </Button>
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border-border bg-surface flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-16">
          <Search className="text-text-muted mb-3 h-8 w-8" />
          <h3 className="text-text-primary text-base font-semibold">No results found</h3>
          <p className="text-text-tertiary mt-1 text-sm">
            No agents matching &ldquo;{search}&rdquo;.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((agent) => (
            <div
              key={agent.id}
              className="border-border bg-surface group relative rounded-xl border p-5 transition-shadow hover:shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/dashboard/agents/${agent.id}`}
                    className="text-text-primary hover:text-accent text-sm font-semibold transition-colors"
                  >
                    {agent.name}
                  </Link>
                  {agent.description && (
                    <p className="text-text-tertiary mt-0.5 truncate text-xs">
                      {agent.description}
                    </p>
                  )}
                </div>
                <Badge variant={statusVariant[agent.status] ?? "neutral"}>
                  {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                </Badge>
              </div>
              <div className="text-text-muted flex items-center gap-2 text-xs">
                <span>{getProviderLabel(agent.providerConfig)}</span>
                <span aria-hidden="true">·</span>
                <span>Updated {timeAgo(agent.updatedAt)}</span>
              </div>
              <div className="border-border mt-4 flex items-center gap-3 border-t pt-3 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                <Link
                  href={`/dashboard/agents/${agent.id}`}
                  className="text-accent hover:text-accent-strong inline-flex items-center gap-1 text-xs font-medium transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  Edit
                </Link>
                <Link
                  href={`/dashboard/agents/${agent.id}/conversations`}
                  className="text-text-tertiary hover:text-text-secondary inline-flex items-center gap-1 text-xs font-medium transition-colors"
                >
                  Conversations
                </Link>
                <button
                  onClick={() => handleDelete(agent.id)}
                  disabled={deleting === agent.id}
                  className="text-danger hover:text-danger-text ml-auto inline-flex items-center gap-1 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                  {deleting === agent.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-border bg-surface overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border text-text-muted border-b text-left text-xs font-medium">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="hidden px-4 py-3 sm:table-cell">Provider</th>
                <th className="hidden px-4 py-3 md:table-cell">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((agent) => (
                <tr
                  key={agent.id}
                  className="border-border hover:bg-surface-hover border-b transition-colors last:border-0"
                >
                  <td className="px-4 py-3">
                    <div>
                      <Link
                        href={`/dashboard/agents/${agent.id}`}
                        className="text-text-primary hover:text-accent font-medium transition-colors"
                      >
                        {agent.name}
                      </Link>
                      {agent.description && (
                        <p className="text-text-tertiary mt-0.5 max-w-[200px] truncate text-xs">
                          {agent.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[agent.status] ?? "neutral"}>
                      {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="text-text-tertiary hidden px-4 py-3 text-xs sm:table-cell">
                    {getProviderLabel(agent.providerConfig)}
                  </td>
                  <td className="text-text-tertiary hidden px-4 py-3 text-xs md:table-cell">
                    {timeAgo(agent.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/dashboard/agents/${agent.id}`}
                        className="text-accent hover:text-accent-strong text-xs font-medium transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(agent.id)}
                        disabled={deleting === agent.id}
                        className="text-danger hover:text-danger-text text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {deleting === agent.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
