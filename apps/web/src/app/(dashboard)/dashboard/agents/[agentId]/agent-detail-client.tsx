"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Bot,
  MessageCircle,
  Network,
  BarChart3,
  Trash2,
  ExternalLink,
  Pencil,
} from "lucide-react"
import { api } from "@/trpc/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

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

const statusVariant: Record<string, "success" | "warning" | "neutral"> = {
  active: "success",
  draft: "warning",
  inactive: "neutral",
}

const tabs = [
  { id: "overview", label: "Overview", icon: Bot },
  { id: "conversations", label: "Conversations", icon: MessageCircle },
  { id: "channels", label: "Channels", icon: Network },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
] as const

type TabId = (typeof tabs)[number]["id"]

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

function OverviewTab({ agent, onEdit }: { agent: Agent; onEdit: () => void }) {
  const getProviderName = (config: Record<string, unknown>) => {
    const p = config.provider as string
    if (p === "openai") return "OpenAI"
    if (p === "openai-compatible") {
      const baseUrl = config.baseUrl as string
      if (baseUrl) return `OpenAI Compatible (${new URL(baseUrl).hostname})`
      return "OpenAI Compatible"
    }
    return p ?? "OpenAI"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Configuration</CardTitle>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="mr-1 h-3 w-3" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-text-muted mb-1 text-xs font-medium uppercase tracking-wider">
                Provider
              </dt>
              <dd className="text-text-primary text-sm">{getProviderName(agent.providerConfig)}</dd>
            </div>
            <div>
              <dt className="text-text-muted mb-1 text-xs font-medium uppercase tracking-wider">
                Model
              </dt>
              <dd className="text-text-primary font-mono text-xs">
                {(agent.providerConfig?.model as string) ?? "gpt-4o"}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted mb-1 text-xs font-medium uppercase tracking-wider">
                Created
              </dt>
              <dd className="text-text-primary text-sm">
                {new Date(agent.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted mb-1 text-xs font-medium uppercase tracking-wider">
                Last Updated
              </dt>
              <dd className="text-text-primary text-sm">
                {new Date(agent.updatedAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {agent.systemPrompt && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">System Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-surface-high text-text-secondary overflow-x-auto whitespace-pre-wrap rounded-lg p-4 font-mono text-xs leading-relaxed">
              {agent.systemPrompt}
            </pre>
          </CardContent>
        </Card>
      )}

      {agent.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary text-sm">{agent.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ConversationsTab({ agent }: { agent: Agent }) {
  const { data: conversations } = api.conversation.list.useQuery({ agentId: agent.id })

  if (!conversations || conversations.length === 0) {
    return (
      <div className="border-border bg-surface flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center">
        <MessageCircle className="text-text-muted mb-3 h-8 w-8" />
        <p className="text-text-primary text-sm font-medium">No conversations yet</p>
        <p className="text-text-tertiary mt-1 text-xs">
          Conversations will appear here once users start chatting with this agent.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => (
        <Link
          key={conv.id}
          href={`/dashboard/agents/${agent.id}/conversations/${conv.id}`}
          className="border-border hover:bg-surface-hover flex items-center justify-between rounded-lg border px-5 py-4 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                conv.status === "active"
                  ? "bg-success"
                  : conv.status === "waiting"
                    ? "bg-warning"
                    : conv.status === "resolved"
                      ? "bg-accent"
                      : "bg-text-muted"
              }`}
            />
            <div>
              <p className="text-text-primary text-sm font-medium">
                {conv.externalUserId ? `User ${conv.externalUserId.slice(0, 8)}` : "Anonymous"}
              </p>
              <p className="text-text-tertiary text-xs">
                {conv.messageCount} messages · {conv.status}
              </p>
            </div>
          </div>
          <span className="text-text-muted text-xs">{timeAgo(conv.updatedAt)}</span>
        </Link>
      ))}
    </div>
  )
}

function ChannelsTab({ agent }: { agent: Agent }) {
  const { data: channelList } = api.channel.list.useQuery({ agentId: agent.id })

  if (!channelList || channelList.length === 0) {
    return (
      <div className="border-border bg-surface flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center">
        <Network className="text-text-muted mb-3 h-8 w-8" />
        <p className="text-text-primary text-sm font-medium">No channels yet</p>
        <p className="text-text-tertiary mt-1 text-xs">
          Create a channel to connect this agent to conversations.
        </p>
        <Link href={`/dashboard/agents/${agent.id}/channels/new`} className="mt-4">
          <Button size="sm">
            <ExternalLink className="mr-1 h-3 w-3" />
            Add Channel
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {channelList.map((ch) => (
        <div
          key={ch.id}
          className="border-border bg-surface group flex items-center gap-4 rounded-xl border p-4 transition-shadow hover:shadow-sm"
        >
          <div className="bg-accent-subtle text-accent flex h-10 w-10 items-center justify-center rounded-lg">
            <Network className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/agents/${agent.id}/channels/${ch.id}`}
                className="text-text-primary hover:text-accent text-sm font-medium transition-colors"
              >
                {ch.name}
              </Link>
              <Badge variant="neutral">{ch.type}</Badge>
              {ch.isActive === "true" ? (
                <span className="text-success-text inline-flex items-center gap-1 text-xs">
                  <span className="bg-success inline-block h-1.5 w-1.5 rounded-full" />
                  Active
                </span>
              ) : (
                <span className="text-text-muted inline-flex items-center gap-1 text-xs">
                  <span className="bg-text-muted inline-block h-1.5 w-1.5 rounded-full" />
                  Inactive
                </span>
              )}
            </div>
            <p className="text-text-muted mt-0.5 text-xs">Updated {timeAgo(ch.updatedAt)}</p>
          </div>
          <Link
            href={`/dashboard/agents/${agent.id}/channels/${ch.id}`}
            className="text-accent hover:text-accent-strong text-xs font-medium transition-colors"
          >
            Configure
          </Link>
        </div>
      ))}
    </div>
  )
}

function AnalyticsTab({ agent }: { agent: Agent }) {
  const { data: ranking } = api.analytics.agentRanking.useQuery()
  const agentStats = ranking?.find((r) => r.agentId === agent.id)

  if (!agentStats) {
    return (
      <div className="border-border bg-surface flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center">
        <BarChart3 className="text-text-muted mb-3 h-8 w-8" />
        <p className="text-text-primary text-sm font-medium">No analytics yet</p>
        <p className="text-text-tertiary mt-1 text-xs">
          Analytics will populate once this agent starts handling conversations.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="border-border bg-surface rounded-xl border p-4">
        <p className="text-text-muted text-xs font-medium">Conversations</p>
        <p className="text-text-primary mt-1 text-2xl font-bold">{agentStats.conversationCount}</p>
      </div>
      <div className="border-border bg-surface rounded-xl border p-4">
        <p className="text-text-muted text-xs font-medium">Messages</p>
        <p className="text-text-primary mt-1 text-2xl font-bold">{agentStats.messageCount}</p>
      </div>
      <div className="border-border bg-surface rounded-xl border p-4">
        <p className="text-text-muted text-xs font-medium">Avg / Conv</p>
        <p className="text-text-primary mt-1 text-2xl font-bold">
          {agentStats.conversationCount > 0
            ? Math.round(agentStats.messageCount / agentStats.conversationCount)
            : 0}
        </p>
      </div>
    </div>
  )
}

export function AgentDetailClient({ agent: initial }: { agent: Agent }) {
  const router = useRouter()
  const utils = api.useUtils()
  const [activeTab, setActiveTab] = useState<TabId>("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(initial.name)
  const [description, setDescription] = useState(initial.description ?? "")
  const [systemPrompt, setSystemPrompt] = useState(initial.systemPrompt ?? "")
  const [status, setStatus] = useState(initial.status)
  const [model, setModel] = useState((initial.providerConfig?.model as string) ?? "gpt-4o")

  const updateAgent = api.agent.update.useMutation({
    onSuccess: () => {
      utils.agent.getById.invalidate({ id: initial.id })
      utils.agent.list.invalidate()
      setIsEditing(false)
      router.refresh()
    },
  })

  const deleteAgent = api.agent.delete.useMutation({
    onSuccess: () => {
      utils.agent.list.invalidate()
      router.push("/dashboard/agents")
    },
  })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    updateAgent.mutate({
      id: initial.id,
      data: {
        name,
        description: description || undefined,
        systemPrompt: systemPrompt || undefined,
        status: status as "active" | "draft" | "inactive",
        providerConfig: { ...initial.providerConfig, model },
      },
    })
  }

  async function handleToggleStatus() {
    const newStatus = status === "active" ? "inactive" : "active"
    setStatus(newStatus)
    updateAgent.mutate({
      id: initial.id,
      data: { status: newStatus },
    })
  }

  async function handleDelete() {
    if (confirm("Delete this agent permanently?")) {
      deleteAgent.mutate({ id: initial.id })
    }
  }

  if (isEditing) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <Link
            href={`/dashboard/agents/${initial.id}`}
            onClick={(e) => {
              e.preventDefault()
              setIsEditing(false)
            }}
            className="text-text-tertiary hover:text-text-secondary mb-4 inline-flex items-center gap-1 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to agent
          </Link>
          <h1 className="text-text-primary text-2xl font-semibold tracking-tight">Edit agent</h1>
          <p className="text-text-tertiary mt-1 text-sm">Update your agent&apos;s configuration.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {updateAgent.error && (
            <div className="border-danger-border bg-danger-subtle text-danger-text rounded-lg border px-4 py-3 text-sm">
              {updateAgent.error.message}
            </div>
          )}

          <div>
            <label htmlFor="name" className="text-text-primary mb-1.5 block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-border bg-surface text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="text-text-primary mb-1.5 block text-sm font-medium"
            >
              Description
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-border bg-surface text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
            />
          </div>

          <div>
            <label
              htmlFor="system-prompt"
              className="text-text-primary mb-1.5 block text-sm font-medium"
            >
              System prompt
            </label>
            <textarea
              id="system-prompt"
              rows={5}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="border-border bg-surface text-text-primary focus:border-accent focus:ring-accent block w-full resize-y rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="status"
                className="text-text-primary mb-1.5 block text-sm font-medium"
              >
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border-border bg-surface text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label htmlFor="model" className="text-text-primary mb-1.5 block text-sm font-medium">
                Model
              </label>
              <input
                id="model"
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="border-border bg-surface text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={updateAgent.isPending}>
              Save changes
            </Button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-text-tertiary hover:text-text-primary rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link
          href="/dashboard/agents"
          className="text-text-tertiary hover:text-text-secondary mb-4 inline-flex items-center gap-1 text-xs font-medium transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to agents
        </Link>
      </div>

      <div className="border-border bg-surface rounded-xl border">
        <div className="border-border flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-accent-subtle text-accent flex h-12 w-12 items-center justify-center rounded-xl">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-text-primary text-xl font-semibold tracking-tight">
                  {initial.name}
                </h1>
                <Badge variant={statusVariant[initial.status] ?? "neutral"}>
                  {initial.status.charAt(0).toUpperCase() + initial.status.slice(1)}
                </Badge>
              </div>
              {initial.description && (
                <p className="text-text-tertiary mt-1 text-sm">{initial.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleToggleStatus}>
              {status === "active" ? "Deactivate" : "Activate"}
            </Button>
            <Button size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="mr-1 h-3 w-3" />
              Edit
            </Button>
          </div>
        </div>

        <div className="border-border flex overflow-x-auto border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-accent text-text-primary"
                    : "text-text-tertiary hover:text-text-secondary border-transparent"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <OverviewTab agent={initial} onEdit={() => setIsEditing(true)} />
          )}
          {activeTab === "conversations" && <ConversationsTab agent={initial} />}
          {activeTab === "channels" && <ChannelsTab agent={initial} />}
          {activeTab === "analytics" && <AnalyticsTab agent={initial} />}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-text-muted text-xs">
          Agent ID: <span className="font-mono">{initial.id}</span>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleteAgent.isPending}
          className="text-danger hover:text-danger-text inline-flex items-center gap-1 text-xs font-medium transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-3 w-3" />
          {deleteAgent.isPending ? "Deleting..." : "Delete agent"}
        </button>
      </div>
    </div>
  )
}
