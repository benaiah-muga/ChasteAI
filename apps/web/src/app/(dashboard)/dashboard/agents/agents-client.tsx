"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/trpc/react"

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

function StatusDot({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: "bg-[#22c55e] animate-pulse-dot shadow-[0_0_6px_#22c55e66]",
    draft: "bg-[#f59e0b]",
    inactive: "bg-[#94a3b8]",
  }

  const labelMap: Record<string, string> = {
    active: "Active",
    draft: "Draft",
    inactive: "Inactive",
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-xs font-medium text-[#64748b]">
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${colorMap[status] ?? colorMap.draft}`}
      />
      {labelMap[status] ?? status}
    </span>
  )
}

export function AgentsClient({ agents: initial }: { agents: Agent[]; workspaces: Workspace[] }) {
  const router = useRouter()
  const utils = api.useUtils()
  const [deleting, setDeleting] = useState<string | null>(null)

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

  function getProviderLabel(config: Record<string, unknown>) {
    const provider = (config.provider as string) ?? "openai"
    const model = (config.model as string) ?? "gpt-4o"
    return `${provider === "openai" ? "OpenAI" : provider} · ${model}`
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

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0f172a]">Agents</h1>
          <p className="mt-1 text-sm text-[#64748b]">
            Configure AI agents that handle conversations across channels.
          </p>
        </div>
        <Link
          href="/dashboard/agents/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4f46e5]"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New agent
        </Link>
      </div>

      {initial.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#e2e8f0] bg-white px-6 py-16">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2ff]">
            <svg
              className="h-6 w-6 text-[#6366f1]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-[#0f172a]">No agents yet</h3>
          <p className="mt-1 text-sm text-[#64748b]">
            Create your first AI agent to start handling conversations.
          </p>
          <Link
            href="/dashboard/agents/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4f46e5]"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create your first agent
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initial.map((agent) => (
            <div
              key={agent.id}
              className="group relative rounded-xl border border-[#e2e8f0] bg-white p-5 transition-shadow hover:shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/dashboard/agents/${agent.id}`}
                    className="text-sm font-semibold text-[#0f172a] hover:text-[#6366f1]"
                  >
                    {agent.name}
                  </Link>
                  {agent.description && (
                    <p className="mt-0.5 truncate text-xs text-[#64748b]">{agent.description}</p>
                  )}
                </div>
                <StatusDot status={agent.status} />
              </div>
              <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
                <span>{getProviderLabel(agent.providerConfig)}</span>
                <span aria-hidden="true">·</span>
                <span>Updated {timeAgo(agent.updatedAt)}</span>
              </div>
              <div className="mt-3 flex items-center gap-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                <Link
                  href={`/dashboard/agents/${agent.id}`}
                  className="text-xs font-medium text-[#6366f1] hover:text-[#4f46e5]"
                >
                  Edit
                </Link>
                <span aria-hidden="true" className="text-[#e2e8f0]">
                  ·
                </span>
                <button
                  onClick={() => handleDelete(agent.id)}
                  disabled={deleting === agent.id}
                  className="text-xs font-medium text-[#ef4444] hover:text-[#dc2626] disabled:opacity-50"
                >
                  {deleting === agent.id ? "Deleting..." : "Delete"}
                </button>
                <span aria-hidden="true" className="text-[#e2e8f0]">
                  ·
                </span>
                <Link
                  href={`/dashboard/agents/${agent.id}/conversations`}
                  className="text-xs font-medium text-[#64748b] hover:text-[#0f172a]"
                >
                  Conversations
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
