"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/trpc/react"

const channelTypes = [
  { value: "widget", label: "Widget", description: "Embeddable chat widget for your website" },
  { value: "web", label: "Web", description: "Chat interface within the dashboard" },
  { value: "api", label: "API", description: "Programmatic access via REST API" },
  { value: "slack", label: "Slack", description: "Connect to a Slack workspace" },
  { value: "discord", label: "Discord", description: "Connect to a Discord server" },
  { value: "telegram", label: "Telegram", description: "Connect via Telegram Bot API" },
  {
    value: "whatsapp",
    label: "WhatsApp",
    description: "Connect via WhatsApp (Baileys QR pairing)",
  },
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
      type: type as "widget" | "web" | "api" | "slack" | "discord" | "telegram" | "whatsapp",
      isActive,
      config: {},
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {createChannel.error && (
        <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#ef4444]">
          {createChannel.error.message}
        </div>
      )}

      <div>
        <label className="mb-3 block text-sm font-medium text-[#0f172a]">Channel type</label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {channelTypes.map((ct) => (
            <button
              key={ct.value}
              type="button"
              onClick={() => setType(ct.value)}
              className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                type === ct.value
                  ? "border-[#6366f1] bg-[#eef2ff] ring-1 ring-[#6366f1]"
                  : "border-[#e2e8f0] bg-white hover:border-[#c7d2fe]"
              }`}
            >
              <p className="text-sm font-medium text-[#0f172a]">{ct.label}</p>
              <p className="mt-0.5 text-xs text-[#64748b]">{ct.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[#0f172a]">
          Channel name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
          placeholder="Website widget"
          required
        />
      </div>

      <div>
        <label htmlFor="is-active" className="mb-1.5 block text-sm font-medium text-[#0f172a]">
          Status
        </label>
        <select
          id="is-active"
          value={isActive}
          onChange={(e) => setIsActive(e.target.value)}
          className="block w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] outline-none transition-colors focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={createChannel.isPending || !name}
          className="inline-flex items-center rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4f46e5] disabled:opacity-50"
        >
          {createChannel.isPending ? "Creating..." : "Create channel"}
        </button>
        <Link
          href={`/dashboard/agents/${agentId}/channels`}
          className="text-sm font-medium text-[#64748b] hover:text-[#0f172a]"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
