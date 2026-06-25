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

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: "bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]",
    draft: "bg-[#fffbeb] text-[#d97706] border-[#fde68a]",
    inactive: "bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]",
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorMap[status] ?? colorMap.draft}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${status === "active" ? "bg-[#22c55e]" : status === "draft" ? "bg-[#f59e0b]" : "bg-[#94a3b8]"}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export function AgentDetailClient({ agent: initial }: { agent: Agent }) {
  const router = useRouter()
  const utils = api.useUtils()
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
        status,
        providerConfig: { ...initial.providerConfig, model },
      },
    })
  }

  async function handleToggleStatus() {
    const newStatus = initial.status === "active" ? "inactive" : "active"
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
      <div className="mx-auto max-w-2xl px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#0f172a]">
            Edit agent
          </h1>
          <p className="mt-1 text-sm text-[#64748b]">
            Update your agent&apos;s configuration.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {updateAgent.error && (
            <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#ef4444]">
              {updateAgent.error.message}
            </div>
          )}

          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[#0f172a]">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] outline-none transition-colors focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-[#0f172a]">
              Description
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] outline-none transition-colors focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
            />
          </div>

          <div>
            <label htmlFor="system-prompt" className="mb-1.5 block text-sm font-medium text-[#0f172a]">
              System prompt
            </label>
            <textarea
              id="system-prompt"
              rows={5}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="block w-full resize-y rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] outline-none transition-colors focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-[#0f172a]">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="block w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] outline-none transition-colors focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label htmlFor="model" className="mb-1.5 block text-sm font-medium text-[#0f172a]">
                Model
              </label>
              <input
                id="model"
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="block w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] outline-none transition-colors focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={updateAgent.isPending}
              className="inline-flex items-center rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4f46e5] disabled:opacity-50"
            >
              {updateAgent.isPending ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-sm font-medium text-[#64748b] hover:text-[#0f172a]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <div className="mb-8">
        <Link
          href="/dashboard/agents"
          className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-[#64748b] hover:text-[#0f172a]"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to agents
        </Link>
      </div>

      <div className="rounded-xl border border-[#e2e8f0] bg-white">
        <div className="border-b border-[#e2e8f0] px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight text-[#0f172a]">
                  {initial.name}
                </h1>
                <StatusBadge status={initial.status} />
              </div>
              {initial.description && (
                <p className="mt-1 text-sm text-[#64748b]">{initial.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleStatus}
                className="rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs font-medium text-[#64748b] transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a]"
              >
                {initial.status === "active" ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-lg bg-[#6366f1] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#4f46e5]"
              >
                Edit
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-6 py-5 text-sm">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
                Provider
              </dt>
              <dd className="mt-1 text-[#0f172a]">
                {(initial.providerConfig?.provider as string) === "openai" ? "OpenAI" : initial.providerConfig?.provider as string}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
                Model
              </dt>
              <dd className="mt-1 font-mono text-xs text-[#0f172a]">
                {initial.providerConfig?.model as string ?? "gpt-4o"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
                Created
              </dt>
              <dd className="mt-1 text-[#0f172a]">
                {new Date(initial.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
                Updated
              </dt>
              <dd className="mt-1 text-[#0f172a]">
                {new Date(initial.updatedAt).toLocaleDateString()}
              </dd>
            </div>
          </div>

          {initial.systemPrompt && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
                System prompt
              </dt>
              <dd className="mt-1 whitespace-pre-wrap rounded-lg bg-[#f8fafc] p-3 font-mono text-xs leading-relaxed text-[#475569]">
                {initial.systemPrompt}
              </dd>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-white px-6 py-4">
        <div>
          <h3 className="text-sm font-medium text-[#0f172a]">Conversations</h3>
          <p className="text-xs text-[#64748b]">View and manage conversations handled by this agent.</p>
        </div>
        <Link
          href={`/dashboard/agents/${initial.id}/conversations`}
          className="rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4f46e5]"
        >
          View conversations
        </Link>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleDelete}
          disabled={deleteAgent.isPending}
          className="text-xs font-medium text-[#ef4444] hover:text-[#dc2626] disabled:opacity-50"
        >
          {deleteAgent.isPending ? "Deleting..." : "Delete agent"}
        </button>
      </div>
    </div>
  )
}
