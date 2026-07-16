"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Bot, Plus, Search, LayoutGrid, List, Trash2, ExternalLink, Copy, Eye } from "lucide-react"
import { api } from "@/trpc/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

type Channel = {
  id: string
  agentId: string
  type: string
  name: string
  config: Record<string, unknown> | null
  isActive: string
}

type Agent = {
  id: string
  workspaceId: string
  name: string
  description: string | null
  systemPrompt: string | null
  knowledgeInstructions: string | null
  status: string
  providerConfig: Record<string, unknown>
  channels: Channel[]
  createdAt: Date
  updatedAt: Date
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

function getEmbedCode(channelId: string) {
  if (typeof window === "undefined") return ""
  const origin = window.location.origin
  return `<script>
  (function(w,d,s,o,f){
    w['ChasteAI']=f;w[f]=w[f]||function(){(w[f].q=w[f].q||[]).push(arguments)};
    var g=d.createElement(s),r=d.getElementsByTagName(s)[0];
    g.async=1;g.src=o;r.parentNode.insertBefore(g,r);
  })(window,document,'script','${origin}/widget/embed.js','chasteai');
  chasteai('init', '${channelId}');
</script>`
}

function getWidgetChannel(channels: Channel[]) {
  return channels.find((c) => c.type === "widget")
}

export function AgentsClient({ agents: initial }: { agents: Agent[] }) {
  const router = useRouter()
  const utils = api.useUtils()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const deleteAgent = api.agent.delete.useMutation({
    onSuccess: () => {
      utils.agent.list.invalidate()
      router.refresh()
      setDeleting(null)
      setDeleteTarget(null)
    },
    onError: () => {
      setDeleting(null)
      setDeleteTarget(null)
    },
  })

  function handleDeleteConfirm() {
    if (deleteTarget) {
      setDeleting(deleteTarget)
      deleteAgent.mutate({ id: deleteTarget })
    }
  }

  function handleCopyEmbed(e: React.MouseEvent, agentId: string, channelId: string) {
    e.preventDefault()
    e.stopPropagation()
    const code = getEmbedCode(channelId)
    navigator.clipboard.writeText(code)
    setCopiedId(agentId)
    setTimeout(() => setCopiedId(null), 2000)
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
          <h1 className="text-text-primary font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            Agents
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            Configure AI agents that handle conversations across channels.
          </p>
        </div>
        <Link href="/dashboard/agents/new">
          <Button variant="primary" size="md">
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
              className="border-border bg-bg rounded-lg pl-9"
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
            <Button variant="primary" size="md">
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
          {filtered.map((agent) => {
            const widgetChannel = getWidgetChannel(agent.channels)
            return (
              <div
                key={agent.id}
                role="link"
                tabIndex={0}
                onClick={() => router.push(`/dashboard/agents/${agent.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    router.push(`/dashboard/agents/${agent.id}`)
                  }
                }}
                className="bg-surface border-border group block cursor-pointer rounded-lg border p-5 transition-shadow hover:shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <span className="text-text-primary font-[family-name:var(--font-display)] text-sm font-medium">
                      {agent.name}
                    </span>
                    {agent.description && (
                      <p className="text-text-tertiary mt-0.5 truncate text-sm">
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
                  <span aria-hidden="true">&middot;</span>
                  <span>Updated {timeAgo(agent.updatedAt)}</span>
                </div>
                <div className="border-border mt-4 flex items-center gap-3 border-t pt-3 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                  <span className="text-accent hover:text-accent-strong pointer-events-auto inline-flex items-center gap-1 text-xs font-medium transition-colors">
                    <ExternalLink className="h-3 w-3" />
                    Edit
                  </span>
                  <Link
                    href={`/dashboard/agents/${agent.id}/preview`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-text-tertiary hover:text-text-secondary pointer-events-auto inline-flex items-center gap-1 text-xs font-medium transition-colors"
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </Link>
                  {widgetChannel && (
                    <button
                      onClick={(e) => handleCopyEmbed(e, agent.id, widgetChannel.id)}
                      className="text-text-tertiary hover:text-text-secondary pointer-events-auto inline-flex items-center gap-1 text-xs font-medium transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                      {copiedId === agent.id ? "Copied!" : "Embed"}
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setDeleteTarget(agent.id)
                    }}
                    disabled={deleting === agent.id}
                    className="text-danger hover:text-danger-text pointer-events-auto ml-auto inline-flex items-center gap-1 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    {deleting === agent.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            )
          })}
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
              {filtered.map((agent) => {
                const widgetChannel = getWidgetChannel(agent.channels)
                return (
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
                        {widgetChannel && (
                          <button
                            onClick={() => {
                              const code = getEmbedCode(widgetChannel.id)
                              navigator.clipboard.writeText(code)
                              setCopiedId(agent.id)
                              setTimeout(() => setCopiedId(null), 2000)
                            }}
                            className="text-text-tertiary hover:text-text-secondary text-xs font-medium transition-colors"
                          >
                            {copiedId === agent.id ? "Copied!" : "Embed"}
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(agent.id)}
                          disabled={deleting === agent.id}
                          className="text-danger hover:text-danger-text text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {deleting === agent.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete agent?"
        description="This will permanently remove this agent and all its conversations. This action cannot be undone."
        confirmText="delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteAgent.isPending}
      />
    </div>
  )
}
