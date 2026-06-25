"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/trpc/react"

type Agent = {
  id: string
  name: string
}

type Channel = {
  id: string
  agentId: string
  type: string
  name: string
  config: Record<string, unknown> | null
  isActive: string
  createdAt: Date
  updatedAt: Date
}

export function ChannelDetailClient({
  agent,
  channel: initial,
  agentId,
}: {
  agent: Agent
  channel: Channel
  agentId: string
}) {
  const router = useRouter()
  const utils = api.useUtils()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(initial.name)
  const [isActive, setIsActive] = useState(initial.isActive)

  const updateChannel = api.channel.update.useMutation({
    onSuccess: () => {
      utils.channel.list.invalidate({ agentId })
      utils.channel.getById.invalidate({ id: initial.id })
      setIsEditing(false)
      router.refresh()
    },
  })

  const deleteChannel = api.channel.delete.useMutation({
    onSuccess: () => {
      utils.channel.list.invalidate({ agentId })
      router.push(`/dashboard/agents/${agentId}/channels`)
    },
  })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    updateChannel.mutate({
      id: initial.id,
      data: { name, isActive, config: initial.config ?? {} },
    })
  }

  async function handleDelete() {
    if (confirm(`Delete channel "${initial.name}"?`)) {
      deleteChannel.mutate({ id: initial.id })
    }
  }

  const origin = typeof window !== "undefined" ? window.location.origin : ""

  const embedCode = initial.type === "widget"
    ? `<script>
  (function(w,d,s,o,f){
    w['ChasteAI']=f;w[f]=w[f]||function(){(w[f].q=w[f].q||[]).push(arguments)};
    var g=d.createElement(s),r=d.getElementsByTagName(s)[0];
    g.async=1;g.src=o;r.parentNode.insertBefore(g,r);
  })(window,document,'script','${origin}/widget/embed.js','chasteai');
  chasteai('init', '${initial.id}');
</script>`
    : null

  if (isEditing) {
    return (
      <div className="mx-auto max-w-2xl px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#0f172a]">Edit channel</h1>
          <p className="mt-1 text-sm text-[#64748b]">Update channel configuration.</p>
        </div>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[#0f172a]">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
              required
            />
          </div>
          <div>
            <label htmlFor="is-active" className="mb-1.5 block text-sm font-medium text-[#0f172a]">Status</label>
            <select
              id="is-active"
              value={isActive}
              onChange={(e) => setIsActive(e.target.value)}
              className="block w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={updateChannel.isPending}
              className="rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white hover:bg-[#4f46e5] disabled:opacity-50"
            >
              {updateChannel.isPending ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="text-sm font-medium text-[#64748b] hover:text-[#0f172a]">Cancel</button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <div className="mb-8">
        <Link
          href={`/dashboard/agents/${agentId}/channels`}
          className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-[#64748b] hover:text-[#0f172a]"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to channels
        </Link>
      </div>

      <div className="rounded-xl border border-[#e2e8f0] bg-white">
        <div className="border-b border-[#e2e8f0] px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight text-[#0f172a]">{initial.name}</h1>
                <span className="rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-xs font-medium text-[#64748b]">{initial.type}</span>
                {initial.isActive === "true" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0fdf4] px-2.5 py-0.5 text-xs font-medium text-[#16a34a]">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-xs font-medium text-[#94a3b8]">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#94a3b8]" />
                    Inactive
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-[#64748b]">Connected to {agent.name}</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg bg-[#6366f1] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#4f46e5]"
            >
              Edit
            </button>
          </div>
        </div>

        <div className="space-y-6 px-6 py-5 text-sm">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">Type</dt>
              <dd className="mt-1 capitalize text-[#0f172a]">{initial.type}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">Created</dt>
              <dd className="mt-1 text-[#0f172a]">{new Date(initial.createdAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">Updated</dt>
              <dd className="mt-1 text-[#0f172a]">{new Date(initial.updatedAt).toLocaleDateString()}</dd>
            </div>
          </div>
        </div>
      </div>

      {embedCode && (
        <div className="mt-6 rounded-xl border border-[#e2e8f0] bg-white">
          <div className="border-b border-[#e2e8f0] px-6 py-4">
            <h2 className="text-sm font-semibold text-[#0f172a]">Embed snippet</h2>
            <p className="mt-0.5 text-xs text-[#64748b]">
              Add this code to your website to enable the chat widget.
            </p>
          </div>
          <div className="px-6 py-4">
            <pre className="overflow-x-auto rounded-lg bg-[#0f172a] p-4 text-xs leading-relaxed text-[#e2e8f0]">
              <code>{embedCode}</code>
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(embedCode)}
              className="mt-3 text-xs font-medium text-[#6366f1] hover:text-[#4f46e5]"
            >
              Copy to clipboard
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleDelete}
          disabled={deleteChannel.isPending}
          className="text-xs font-medium text-[#ef4444] hover:text-[#dc2626]"
        >
          {deleteChannel.isPending ? "Deleting..." : "Delete channel"}
        </button>
      </div>
    </div>
  )
}
