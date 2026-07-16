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
  BookOpen,
  FileText,
  Globe,
  Lock,
  Upload,
  X,
  Loader2,
} from "lucide-react"
import { api } from "@/trpc/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

const PROVIDER_PRESETS = [
  {
    value: "nvidia",
    label: "NVIDIA NIM",
    type: "openai-compatible",
    baseUrl: "https://integrate.api.nvidia.com/v1",
    model: "poolside/laguna-xs-2.1",
  },
  {
    value: "openai",
    label: "OpenAI",
    type: "openai",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o",
  },
  {
    value: "groq",
    label: "Groq",
    type: "openai-compatible",
    baseUrl: "https://api.groq.com/openai/v1",
    model: "mixtral-8x7b-32768",
  },
  {
    value: "together",
    label: "Together AI",
    type: "openai-compatible",
    baseUrl: "https://api.together.xyz/v1",
    model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
  },
  {
    value: "fireworks",
    label: "Fireworks AI",
    type: "openai-compatible",
    baseUrl: "https://api.fireworks.ai/inference/v1",
    model: "accounts/fireworks/models/llama-v3p1-8b-instruct",
  },
  {
    value: "deepseek",
    label: "DeepSeek",
    type: "openai-compatible",
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
  },
  {
    value: "mistral",
    label: "Mistral AI",
    type: "openai-compatible",
    baseUrl: "https://api.mistral.ai/v1",
    model: "mistral-large-latest",
  },
  {
    value: "custom",
    label: "Custom (OpenAI Compatible)",
    type: "openai-compatible",
    baseUrl: "",
    model: "",
  },
] as const

type Agent = {
  id: string
  name: string
  description: string | null
  systemPrompt: string | null
  knowledgeInstructions: string | null
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
  { id: "knowledge", label: "Knowledge", icon: BookOpen },
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
      <div className="bg-surface border-border rounded-lg border p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-text-primary text-sm font-medium">Configuration</h3>
          <Button variant="subtle" size="sm" onClick={onEdit}>
            <Pencil className="mr-1 h-3 w-3" />
            Edit
          </Button>
        </div>
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
      </div>

      {agent.systemPrompt && (
        <div className="bg-surface border-border rounded-lg border p-5">
          <h3 className="text-text-primary mb-4 text-sm font-medium">System Prompt</h3>
          <pre className="bg-bg border-border text-text-secondary overflow-x-auto whitespace-pre-wrap rounded-lg border p-4 font-mono text-sm leading-relaxed">
            {agent.systemPrompt}
          </pre>
        </div>
      )}

      {agent.description && (
        <div className="bg-surface border-border rounded-lg border p-5">
          <h3 className="text-text-primary mb-4 text-sm font-medium">Description</h3>
          <p className="text-text-secondary text-sm">{agent.description}</p>
        </div>
      )}
    </div>
  )
}

function ConversationsTab({ agent }: { agent: Agent }) {
  const { data: conversations } = api.conversation.list.useQuery({ agentId: agent.id })

  if (!conversations || conversations.length === 0) {
    return (
      <div className="bg-surface border-border flex flex-col items-center justify-center rounded-lg border px-6 py-16 text-center">
        <MessageCircle className="text-text-muted mb-3 h-8 w-8" />
        <p className="text-text-primary text-sm font-medium">No conversations yet</p>
        <p className="text-text-tertiary mt-1 text-xs">
          Conversations will appear here once users start chatting with this agent.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-surface border-border divide-border divide-y rounded-lg border">
      {conversations.map((conv) => (
        <Link
          key={conv.id}
          href={`/dashboard/agents/${agent.id}/conversations/${conv.id}`}
          className="hover:bg-surface-hover flex items-center justify-between px-5 py-4 transition-colors first:rounded-t-lg last:rounded-b-lg"
        >
          <div className="flex min-w-0 items-center gap-3">
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

function KnowledgeTab({ agent }: { agent: Agent }) {
  const utils = api.useUtils()
  const [instructions, setInstructions] = useState(agent.knowledgeInstructions ?? "")
  const [isSaving, setIsSaving] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)

  const { data: assignedDocs, isLoading: loadingAssigned } =
    api.agentKnowledge.getAssignedDocuments.useQuery({ agentId: agent.id })
  const { data: workspaceDocs } = api.agentKnowledge.getWorkspaceDocuments.useQuery({
    agentId: agent.id,
  })

  const updateInstructions = api.agentKnowledge.updateInstructions.useMutation({
    onSuccess: () => {
      setIsSaving(false)
      utils.agent.getById.invalidate({ id: agent.id })
    },
  })

  const assignDoc = api.agentKnowledge.assignDocument.useMutation({
    onSuccess: () => {
      utils.agentKnowledge.getAssignedDocuments.invalidate({ agentId: agent.id })
      setShowAssignModal(false)
    },
  })

  const unassignDoc = api.agentKnowledge.unassignDocument.useMutation({
    onSuccess: () => {
      utils.agentKnowledge.getAssignedDocuments.invalidate({ agentId: agent.id })
    },
  })

  function handleSaveInstructions() {
    setIsSaving(true)
    updateInstructions.mutate({ agentId: agent.id, instructions: instructions || null })
  }

  const assignedDocIds = new Set(assignedDocs?.map((d) => d.id) ?? [])
  const unassignedDocs = workspaceDocs?.filter((d) => !assignedDocIds.has(d.id)) ?? []

  return (
    <div className="space-y-6">
      <div className="bg-surface border-border rounded-lg border p-5">
        <div className="mb-4">
          <h3 className="text-text-primary text-sm font-medium">Assigned Documents</h3>
          <p className="text-text-tertiary mt-0.5 text-xs">
            Documents linked to this agent. Private documents are only accessible by this agent.
          </p>
        </div>
        {loadingAssigned ? (
          <p className="text-text-muted text-xs">Loading...</p>
        ) : !assignedDocs || assignedDocs.length === 0 ? (
          <div className="py-8 text-center">
            <FileText className="text-text-muted mx-auto mb-2 h-8 w-8" />
            <p className="text-text-tertiary text-xs">No documents assigned yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {assignedDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-surface-elevated border-border flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="bg-accent/10 text-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                    {doc.sourceType === "website" ? (
                      <Globe className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-medium">
                      {doc.title ?? "Untitled"}
                    </p>
                    <p className="text-text-muted text-xs">
                      {doc.sourceType} · {doc.status}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-muted inline-flex items-center gap-1 text-xs">
                    <Lock className="h-3 w-3" />
                    Private
                  </span>
                  <button
                    onClick={() => unassignDoc.mutate({ agentId: agent.id, documentId: doc.id })}
                    className="text-danger hover:text-danger/80 rounded-md p-1 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => setShowAssignModal(true)}
          className="text-accent hover:text-accent/80 mt-4 inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
        >
          <Upload className="h-3.5 w-3.5" />
          Assign document
        </button>
      </div>

      <div className="bg-surface border-border rounded-lg border p-5">
        <div className="mb-4">
          <h3 className="text-text-primary text-sm font-medium">Knowledge Instructions</h3>
          <p className="text-text-tertiary mt-0.5 text-xs">
            Custom instructions for how this agent uses its knowledge base.
          </p>
        </div>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g., Always reference pricing information. Prioritize technical documentation over blog posts."
          className="border-border bg-bg text-text-primary placeholder:text-text-muted focus:ring-accent/20 focus:border-accent w-full resize-y rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1"
          rows={4}
        />
        <div className="mt-3 flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSaveInstructions}
            disabled={isSaving || instructions === (agent.knowledgeInstructions ?? "")}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowAssignModal(false)} />
          <div className="bg-bg border-border relative z-10 w-full max-w-lg rounded-xl border p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-text-primary text-sm font-semibold">Assign Document</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {unassignedDocs.length === 0 ? (
              <p className="text-text-tertiary py-6 text-center text-sm">
                All workspace documents are already assigned to this agent.
              </p>
            ) : (
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {unassignedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-surface border-border flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {doc.sourceType === "website" ? (
                        <Globe className="text-text-muted h-4 w-4" />
                      ) : (
                        <FileText className="text-text-muted h-4 w-4" />
                      )}
                      <div>
                        <p className="text-text-primary text-sm font-medium">
                          {doc.title ?? "Untitled"}
                        </p>
                        <p className="text-text-muted text-xs">
                          {doc.sourceType} · {doc.status}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => assignDoc.mutate({ agentId: agent.id, documentId: doc.id })}
                      className="text-accent hover:text-accent/80 text-xs font-medium transition-colors"
                    >
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ChannelsTab({ agent }: { agent: Agent }) {
  const { data: channelList } = api.channel.list.useQuery({ agentId: agent.id })

  if (!channelList || channelList.length === 0) {
    return (
      <div className="bg-surface border-border flex flex-col items-center justify-center rounded-lg border px-6 py-16 text-center">
        <Network className="text-text-muted mb-3 h-8 w-8" />
        <p className="text-text-primary text-sm font-medium">No channels yet</p>
        <p className="text-text-tertiary mt-1 text-xs">
          Create a channel to connect this agent to conversations.
        </p>
        <Link href={`/dashboard/agents/${agent.id}/channels/new`} className="mt-4">
          <Button size="sm" variant="secondary">
            <ExternalLink className="mr-1 h-3 w-3" />
            Add Channel
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-surface border-border divide-border divide-y rounded-lg border">
      {channelList.map((ch) => (
        <div
          key={ch.id}
          className="flex items-center gap-4 px-5 py-4 first:rounded-t-lg last:rounded-b-lg"
        >
          <div className="bg-accent/10 text-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
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
                <span className="text-success inline-flex items-center gap-1 text-xs">
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
            className="text-accent hover:text-accent/80 text-xs font-medium transition-colors"
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
      <div className="bg-surface border-border flex flex-col items-center justify-center rounded-lg border px-6 py-16 text-center">
        <BarChart3 className="text-text-muted mb-3 h-8 w-8" />
        <p className="text-text-primary text-sm font-medium">No analytics yet</p>
        <p className="text-text-tertiary mt-1 text-xs">
          Analytics will populate once this agent starts handling conversations.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="bg-surface border-border rounded-lg border p-5">
        <p className="text-text-muted text-xs font-medium uppercase tracking-wider">
          Conversations
        </p>
        <p className="text-text-primary mt-2 text-2xl font-bold">{agentStats.conversationCount}</p>
      </div>
      <div className="bg-surface border-border rounded-lg border p-5">
        <p className="text-text-muted text-xs font-medium uppercase tracking-wider">Messages</p>
        <p className="text-text-primary mt-2 text-2xl font-bold">{agentStats.messageCount}</p>
      </div>
      <div className="bg-surface border-border rounded-lg border p-5">
        <p className="text-text-muted text-xs font-medium uppercase tracking-wider">Avg / Conv</p>
        <p className="text-text-primary mt-2 text-2xl font-bold">
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
  const [knowledgeInstructions, setKnowledgeInstructions] = useState(
    initial.knowledgeInstructions ?? "",
  )
  const [status, setStatus] = useState(initial.status)
  const [model, setModel] = useState((initial.providerConfig?.model as string) ?? "gpt-4o")
  const [apiKey, setApiKey] = useState((initial.providerConfig?.apiKey as string) ?? "")
  const [baseUrl, setBaseUrl] = useState(
    (initial.providerConfig?.baseUrl as string) ?? "https://api.openai.com/v1",
  )
  const [preset, setPreset] = useState((initial.providerConfig?.preset as string) ?? "nvidia")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [temperature, setTemperature] = useState(
    ((initial.providerConfig?.parameters as Record<string, unknown>)?.temperature as number) ?? 0.7,
  )
  const [maxTokens, setMaxTokens] = useState(
    ((initial.providerConfig?.parameters as Record<string, unknown>)?.maxTokens as number) ?? 4096,
  )
  const [topP, setTopP] = useState(
    ((initial.providerConfig?.parameters as Record<string, unknown>)?.topP as number) ?? 0.9,
  )
  const [contentSafetyEnabled, setContentSafetyEnabled] = useState(
    ((initial.providerConfig?.contentSafety as Record<string, unknown>)?.enabled as boolean) ??
      false,
  )
  const [contentSafetyCheckInput, setContentSafetyCheckInput] = useState(
    ((initial.providerConfig?.contentSafety as Record<string, unknown>)?.checkInput as boolean) ??
      false,
  )
  const [contentSafetyCheckResponse, setContentSafetyCheckResponse] = useState(
    ((initial.providerConfig?.contentSafety as Record<string, unknown>)
      ?.checkResponse as boolean) ?? true,
  )
  const [contentSafetyModel, setContentSafetyModel] = useState(
    ((initial.providerConfig?.contentSafety as Record<string, unknown>)?.model as string) ??
      "nvidia/nemotron-3.5-content-safety",
  )
  const [contentSafetyBaseUrl, setContentSafetyBaseUrl] = useState(
    ((initial.providerConfig?.contentSafety as Record<string, unknown>)?.baseUrl as string) ??
      "https://integrate.api.nvidia.com/v1",
  )
  const [contentSafetyTest, setContentSafetyTest] = useState<
    "idle" | "testing" | "passed" | "failed"
  >("idle")
  const [contentSafetyTestMsg, setContentSafetyTestMsg] = useState("")
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [loadingModels, setLoadingModels] = useState(false)

  function handlePresetChange(value: string) {
    setPreset(value)
    const p = PROVIDER_PRESETS.find((pp) => pp.value === value)
    if (p) {
      setBaseUrl(p.baseUrl)
      setModel(p.model)
    }
  }

  async function fetchModels() {
    if (!apiKey && !baseUrl) return
    setLoadingModels(true)
    try {
      const response = await fetch("/api/models/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: PROVIDER_PRESETS.find((p) => p.value === preset)?.type ?? "openai-compatible",
          apiKey,
          baseUrl: baseUrl || undefined,
        }),
      })
      const data = await response.json()
      if (data.models) {
        setAvailableModels(data.models.map((m: { id: string }) => m.id))
      }
    } catch {
      setAvailableModels([])
    } finally {
      setLoadingModels(false)
    }
  }

  async function testContentSafetyConnection() {
    const apiKeyToUse = contentSafetyBaseUrl.includes("nvidia") ? apiKey : apiKey
    if (!apiKeyToUse) {
      setContentSafetyTest("failed")
      setContentSafetyTestMsg("Enter an API key in AI Configuration first.")
      return
    }
    setContentSafetyTest("testing")
    setContentSafetyTestMsg("")
    try {
      const res = await fetch("/api/models/test-safety", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKeyToUse,
          baseUrl: contentSafetyBaseUrl,
          model: contentSafetyModel,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setContentSafetyTest("passed")
        setContentSafetyTestMsg("")
      } else {
        setContentSafetyTest("failed")
        setContentSafetyTestMsg(data.error ?? "Connection failed")
      }
    } catch (e) {
      setContentSafetyTest("failed")
      setContentSafetyTestMsg(e instanceof Error ? e.message : "Connection failed")
    }
  }

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
    const currentPreset = PROVIDER_PRESETS.find((p) => p.value === preset)
    updateAgent.mutate({
      id: initial.id,
      data: {
        name,
        description: description || undefined,
        systemPrompt: systemPrompt || undefined,
        knowledgeInstructions: knowledgeInstructions || undefined,
        status: status as "active" | "draft" | "inactive",
        providerConfig: {
          ...initial.providerConfig,
          provider: currentPreset?.type ?? "openai-compatible",
          preset,
          model,
          baseUrl,
          ...(apiKey ? { apiKey } : {}),
          parameters: {
            temperature,
            maxTokens,
            topP,
          },
          contentSafety: {
            enabled: contentSafetyEnabled,
            checkInput: contentSafetyCheckInput,
            checkResponse: contentSafetyCheckResponse,
            model: contentSafetyModel,
            baseUrl: contentSafetyBaseUrl,
          },
        },
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

  async function handleDeleteConfirm() {
    deleteAgent.mutate({ id: initial.id })
  }

  if (isEditing) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Link
            href={`/dashboard/agents/${initial.id}`}
            onClick={(e) => {
              e.preventDefault()
              setIsEditing(false)
            }}
            className="text-text-tertiary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to agent
          </Link>
          <h1 className="text-text-primary font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            Edit agent
          </h1>
          <p className="text-text-tertiary mt-1 text-sm">Update your agent&apos;s configuration.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {updateAgent.error && (
            <div className="border-danger bg-danger/10 text-danger rounded-lg border px-4 py-3 text-sm">
              {updateAgent.error.message}
            </div>
          )}

          <div className="bg-surface border-border space-y-5 rounded-lg border p-5">
            <h3 className="text-text-primary text-sm font-medium">General</h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="text-text-secondary mb-1.5 block text-[13px] font-medium"
                >
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="text-text-secondary mb-1.5 block text-[13px] font-medium"
                >
                  Description
                </label>
                <Input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="status"
                    className="text-text-secondary mb-1.5 block text-[13px] font-medium"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent/20 flex h-9 w-full rounded-lg border px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-1"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="preset"
                    className="text-text-secondary mb-1.5 block text-[13px] font-medium"
                  >
                    Provider
                  </label>
                  <select
                    id="preset"
                    value={preset}
                    onChange={(e) => handlePresetChange(e.target.value)}
                    className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent/20 flex h-9 w-full rounded-lg border px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-1"
                  >
                    {PROVIDER_PRESETS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface border-border space-y-5 rounded-lg border p-5">
            <h3 className="text-text-primary text-sm font-medium">AI Configuration</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="api-key"
                    className="text-text-secondary mb-1.5 block text-[13px] font-medium"
                  >
                    API Key
                  </label>
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Leave blank to use env default"
                  />
                </div>
                <div>
                  <label
                    htmlFor="base-url"
                    className="text-text-secondary mb-1.5 block text-[13px] font-medium"
                  >
                    Base URL
                  </label>
                  <Input
                    id="base-url"
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://api.openai.com/v1"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="model" className="text-text-secondary text-[13px] font-medium">
                    Model
                  </label>
                  <button
                    type="button"
                    onClick={fetchModels}
                    disabled={loadingModels || (!apiKey && !baseUrl)}
                    className="text-accent hover:text-accent/80 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {loadingModels ? "Loading..." : "Fetch available models"}
                  </button>
                </div>
                {availableModels.length > 0 ? (
                  <select
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent/20 flex h-9 w-full rounded-lg border px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-1"
                  >
                    {availableModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id="model"
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="poolside/laguna-xs-2.1"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="bg-surface border-border space-y-5 rounded-lg border p-5">
            <h3 className="text-text-primary text-sm font-medium">Model Parameters</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-text-secondary mb-1.5 block text-[13px] font-medium">
                    Temperature: {temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-text-muted mt-1 flex justify-between text-[11px]">
                    <span>Precise (0)</span>
                    <span>Creative (2)</span>
                  </div>
                </div>
                <div>
                  <label className="text-text-secondary mb-1.5 block text-[13px] font-medium">
                    Top P: {topP}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={topP}
                    onChange={(e) => setTopP(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-text-muted mt-1 flex justify-between text-[11px]">
                    <span>Focused (0)</span>
                    <span>Diverse (1)</span>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="max-tokens"
                    className="text-text-secondary mb-1.5 block text-[13px] font-medium"
                  >
                    Max Tokens
                  </label>
                  <Input
                    id="max-tokens"
                    type="number"
                    min="1"
                    max="128000"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value) || 4096)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface border-border space-y-5 rounded-lg border p-5">
            <h3 className="text-text-primary text-sm font-medium">Content Safety</h3>
            <p className="text-text-tertiary text-[13px]">
              Moderate user inputs and AI responses for harmful content.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-text-primary text-[13px] font-medium">
                    Enable Content Safety
                  </label>
                  <p className="text-text-muted text-xs">
                    Check AI responses for harmful content (recommended for production)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setContentSafetyEnabled(!contentSafetyEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    contentSafetyEnabled ? "bg-accent" : "bg-surface-high"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                      contentSafetyEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {contentSafetyEnabled && (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="safety-model"
                        className="text-text-secondary mb-1.5 block text-[13px] font-medium"
                      >
                        Safety Model
                      </label>
                      <Input
                        id="safety-model"
                        type="text"
                        value={contentSafetyModel}
                        onChange={(e) => {
                          setContentSafetyModel(e.target.value)
                          setContentSafetyTest("idle")
                        }}
                        placeholder="nvidia/nemotron-3.5-content-safety"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="safety-base-url"
                        className="text-text-secondary mb-1.5 block text-[13px] font-medium"
                      >
                        Safety Base URL
                      </label>
                      <Input
                        id="safety-base-url"
                        type="text"
                        value={contentSafetyBaseUrl}
                        onChange={(e) => {
                          setContentSafetyBaseUrl(e.target.value)
                          setContentSafetyTest("idle")
                        }}
                        placeholder="https://integrate.api.nvidia.com/v1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={contentSafetyCheckResponse}
                        onChange={(e) => setContentSafetyCheckResponse(e.target.checked)}
                        className="border-border text-accent focus:ring-accent/20 rounded"
                      />
                      <span className="text-text-primary text-[13px]">Check AI responses</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={contentSafetyCheckInput}
                        onChange={(e) => setContentSafetyCheckInput(e.target.checked)}
                        className="border-border text-accent focus:ring-accent/20 rounded"
                      />
                      <span className="text-text-primary text-[13px]">Check user inputs</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={testContentSafetyConnection}
                      disabled={contentSafetyTest === "testing"}
                    >
                      {contentSafetyTest === "testing" ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Testing...
                        </span>
                      ) : (
                        "Test Safety Model"
                      )}
                    </Button>
                    {contentSafetyTest === "passed" && (
                      <span className="text-success inline-flex items-center gap-1.5 text-xs font-medium">
                        <span className="bg-success inline-block h-1.5 w-1.5 rounded-full" />
                        Connected
                      </span>
                    )}
                    {contentSafetyTest === "failed" && (
                      <span className="text-danger text-xs">{contentSafetyTestMsg}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-surface border-border space-y-5 rounded-lg border p-5">
            <h3 className="text-text-primary text-sm font-medium">System Instructions</h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="system-prompt"
                  className="text-text-secondary mb-1.5 block text-[13px] font-medium"
                >
                  System prompt
                </label>
                <textarea
                  id="system-prompt"
                  rows={5}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="border-border text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-accent/20 flex w-full resize-y rounded-lg border bg-transparent px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-1"
                />
              </div>

              <div>
                <label
                  htmlFor="knowledge-instructions"
                  className="text-text-secondary mb-1.5 block text-[13px] font-medium"
                >
                  Knowledge instructions
                </label>
                <textarea
                  id="knowledge-instructions"
                  rows={3}
                  value={knowledgeInstructions}
                  onChange={(e) => setKnowledgeInstructions(e.target.value)}
                  className="border-border text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-accent/20 flex w-full resize-y rounded-lg border bg-transparent px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-1"
                  placeholder="e.g., Always reference pricing info. Prioritize technical docs over blog posts."
                />
              </div>
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
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/dashboard/agents"
          className="text-text-tertiary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to agents
        </Link>
      </div>

      <div className="bg-surface border-border rounded-lg border p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-accent/10 text-accent flex h-12 w-12 items-center justify-center rounded-lg">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-text-primary font-[family-name:var(--font-display)] text-xl font-semibold">
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
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/dashboard/agents/${initial.id}/preview`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-1 h-3 w-3" />
                Preview
              </Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={handleToggleStatus}>
              {status === "active" ? "Deactivate" : "Activate"}
            </Button>
            <Button size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="mr-1 h-3 w-3" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div
          className="border-border flex overflow-x-auto border-b"
          style={{ scrollbarWidth: "none" }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-text-primary border-accent"
                    : "text-text-tertiary hover:text-text-secondary border-transparent"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
        <div className="from-bg pointer-events-none absolute bottom-0 right-0 top-0 w-8 bg-gradient-to-l to-transparent sm:hidden" />

        <div className="py-6">
          {activeTab === "overview" && (
            <OverviewTab agent={initial} onEdit={() => setIsEditing(true)} />
          )}
          {activeTab === "knowledge" && <KnowledgeTab agent={initial} />}
          {activeTab === "conversations" && <ConversationsTab agent={initial} />}
          {activeTab === "channels" && <ChannelsTab agent={initial} />}
          {activeTab === "analytics" && <AnalyticsTab agent={initial} />}
        </div>
      </div>

      <div className="border-border flex items-center justify-between border-t pt-6">
        <div className="text-text-muted text-xs">
          Agent ID: <span className="font-mono">{initial.id}</span>
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={deleteAgent.isPending}
          className="text-danger/80 hover:text-danger inline-flex items-center gap-1 text-xs font-medium transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-3 w-3" />
          {deleteAgent.isPending ? "Deleting..." : "Delete agent"}
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title={`Delete "${initial.name}"?`}
        description="This will permanently remove this agent and all its conversations. This action cannot be undone."
        confirmText={initial.name}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        loading={deleteAgent.isPending}
      />
    </div>
  )
}
