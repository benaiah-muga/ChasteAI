"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/trpc/react"

const channelTypes = [
  { value: "widget", label: "Widget", description: "Embeddable chat widget for your website" },
  { value: "web", label: "Web", description: "Chat interface within the dashboard" },
  { value: "api", label: "API", description: "Programmatic access via REST API" },
  { value: "telegram", label: "Telegram", description: "Connect via Telegram Bot API" },
]

export function ChannelForm({ agentId }: { agentId: string }) {
  const router = useRouter()
  const utils = api.useUtils()
  const [name, setName] = useState("")
  const [type, setType] = useState("widget")
  const [isActive, setIsActive] = useState("true")

  const createChannel = api.channel.create.useMutation({
    onSuccess: () => {
      utils.channel.list.invalidate({ agentId })
      router.push(`/dashboard/agents/${agentId}/channels`)
      router.refresh()
    },
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return

    createChannel.mutate({
      agentId,
      name,
      type: type as "widget" | "web" | "api" | "telegram",
      isActive,
      config: {},
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {createChannel.error && (
        <div className="border-danger-border bg-danger-subtle text-danger-text rounded-lg border px-4 py-3 text-sm">
          {createChannel.error.message}
        </div>
      )}

      <div>
        <label className="text-text-primary mb-3 block text-sm font-medium">Channel type</label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {channelTypes.map((ct) => (
            <button
              key={ct.value}
              type="button"
              onClick={() => setType(ct.value)}
              className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                type === ct.value
                  ? "border-accent bg-accent-subtle ring-accent ring-1"
                  : "border-border bg-bg hover:border-accent/40"
              }`}
            >
              <p className="text-text-primary text-sm font-medium">{ct.label}</p>
              <p className="text-text-secondary mt-0.5 text-xs">{ct.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="name" className="text-text-primary mb-1.5 block text-sm font-medium">
          Channel name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-border bg-bg text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
          placeholder="Website widget"
          required
        />
      </div>

      <div>
        <label htmlFor="is-active" className="text-text-primary mb-1.5 block text-sm font-medium">
          Status
        </label>
        <select
          id="is-active"
          value={isActive}
          onChange={(e) => setIsActive(e.target.value)}
          className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={createChannel.isPending || !name}
          className="bg-accent text-accent-text hover:bg-accent-strong inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {createChannel.isPending ? "Creating..." : "Create channel"}
        </button>
        <Link
          href={`/dashboard/agents/${agentId}/channels`}
          className="text-text-secondary hover:text-text-primary text-sm font-medium"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
