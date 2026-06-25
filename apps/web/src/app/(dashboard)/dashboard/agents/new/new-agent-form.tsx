"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/trpc/react"

export function NewAgentForm({ workspaces }: { workspaces: { id: string; name: string }[] }) {
  const router = useRouter()
  const utils = api.useUtils()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id ?? "")
  const [status, setStatus] = useState<"active" | "inactive" | "draft">("draft")
  const [model, setModel] = useState("gpt-4o")

  const createAgent = api.agent.create.useMutation({
    onSuccess: (agent) => {
      utils.agent.list.invalidate()
      router.push(`/dashboard/agents/${agent.id}`)
    },
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !workspaceId) return

    createAgent.mutate({
      name,
      description: description || undefined,
      systemPrompt: systemPrompt || undefined,
      status,
      workspaceId,
      providerConfig: {
        provider: "openai",
        model,
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {createAgent.error && (
        <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#ef4444]">
          {createAgent.error.message}
        </div>
      )}

      <div>
        <label htmlFor="workspace" className="mb-1.5 block text-sm font-medium text-[#0f172a]">
          Workspace
        </label>
        <select
          id="workspace"
          value={workspaceId}
          onChange={(e) => setWorkspaceId(e.target.value)}
          className="block w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] outline-none transition-colors focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
          required
        >
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[#0f172a]">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
          placeholder="Support Agent"
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
          className="block w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
          placeholder="Handles billing and account inquiries"
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
          className="block w-full resize-y rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
          placeholder="You are a helpful customer support agent..."
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
            onChange={(e) => setStatus(e.target.value as "active" | "inactive" | "draft")}
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
            className="block w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
            placeholder="gpt-4o"
          />
          <p className="mt-1 text-xs text-[#94a3b8]">
            Provider: OpenAI. Set <code className="font-mono text-[#64748b]">OPENAI_API_KEY</code>{" "}
            in your environment.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={createAgent.isPending || !name || !workspaceId}
          className="inline-flex items-center rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4f46e5] disabled:opacity-50"
        >
          {createAgent.isPending ? "Creating..." : "Create agent"}
        </button>
        <Link
          href="/dashboard/agents"
          className="text-sm font-medium text-[#64748b] hover:text-[#0f172a]"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
