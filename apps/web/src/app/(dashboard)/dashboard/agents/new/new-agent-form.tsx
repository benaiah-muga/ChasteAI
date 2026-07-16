"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/trpc/react"

const PROVIDER_PRESETS = [
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
    value: "nvidia",
    label: "NVIDIA",
    type: "openai-compatible",
    baseUrl: "https://integrate.api.nvidia.com/v1",
    model: "nvidia/llama-3.1-nemotron-70b-instruct",
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

export function NewAgentForm() {
  const router = useRouter()
  const utils = api.useUtils()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [knowledgeInstructions, setKnowledgeInstructions] = useState("")
  const [status, setStatus] = useState<"active" | "inactive" | "draft">("draft")
  const [preset, setPreset] = useState("openai")
  const [apiKey, setApiKey] = useState("")
  const [baseUrl, setBaseUrl] = useState("https://api.openai.com/v1")
  const [model, setModel] = useState("gpt-4o")

  const currentPreset = PROVIDER_PRESETS.find((p) => p.value === preset)

  function handlePresetChange(value: string) {
    setPreset(value)
    const p = PROVIDER_PRESETS.find((pp) => pp.value === value)
    if (p) {
      setBaseUrl(p.baseUrl)
      setModel(p.model)
    }
  }

  const createAgent = api.agent.create.useMutation({
    onSuccess: (agent) => {
      utils.agent.list.invalidate()
      router.push(`/dashboard/agents/${agent.id}`)
    },
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return

    const providerConfig: Record<string, unknown> = {
      provider: currentPreset?.type ?? "openai-compatible",
      preset,
      model,
      baseUrl,
    }
    if (apiKey) providerConfig.apiKey = apiKey

    createAgent.mutate({
      name,
      description: description || undefined,
      systemPrompt: systemPrompt || undefined,
      knowledgeInstructions: knowledgeInstructions || undefined,
      status,
      providerConfig,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {createAgent.error && (
        <div className="border-danger-border bg-danger-subtle text-danger-text rounded-lg border px-4 py-3 text-sm">
          {createAgent.error.message}
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
          className="border-border bg-bg text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
          placeholder="Support Agent"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="text-text-primary mb-1.5 block text-sm font-medium">
          Description
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border-border bg-bg text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
          placeholder="Handles billing and account inquiries"
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
          className="border-border bg-bg text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-accent block w-full resize-y rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
          placeholder="You are a helpful customer support agent..."
        />
      </div>

      <div>
        <label
          htmlFor="knowledge-instructions"
          className="text-text-primary mb-1.5 block text-sm font-medium"
        >
          Knowledge instructions
        </label>
        <textarea
          id="knowledge-instructions"
          rows={3}
          value={knowledgeInstructions}
          onChange={(e) => setKnowledgeInstructions(e.target.value)}
          className="border-border bg-bg text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-accent block w-full resize-y rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
          placeholder="e.g., Always reference pricing info. Prioritize technical docs over blog posts."
        />
        <p className="text-text-muted mt-1 text-xs">
          Custom instructions for how this agent uses its knowledge base.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="text-text-primary mb-1.5 block text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "active" | "inactive" | "draft")}
            className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label htmlFor="preset" className="text-text-primary mb-1.5 block text-sm font-medium">
            Provider
          </label>
          <select
            id="preset"
            value={preset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
          >
            {PROVIDER_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="api-key" className="text-text-primary mb-1.5 block text-sm font-medium">
            API Key
          </label>
          <input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="border-border bg-bg text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
            placeholder="Leave blank to use env default"
          />
          <p className="text-text-muted mt-1 text-xs">
            Falls back to <code className="text-text-secondary font-mono">OPENAI_API_KEY</code> or{" "}
            <code className="text-text-secondary font-mono">GROQ_API_KEY</code> env vars.
          </p>
        </div>
        <div>
          <label htmlFor="base-url" className="text-text-primary mb-1.5 block text-sm font-medium">
            Base URL
          </label>
          <input
            id="base-url"
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="border-border bg-bg text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
            placeholder="https://api.openai.com/v1"
          />
        </div>
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
          className="border-border bg-bg text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
          placeholder={currentPreset?.model || "gpt-4o"}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={createAgent.isPending || !name}
          className="bg-accent text-accent-text hover:bg-accent-strong inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {createAgent.isPending ? "Creating..." : "Create agent"}
        </button>
        <Link
          href="/dashboard/agents"
          className="text-text-secondary hover:text-text-primary text-sm font-medium"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
