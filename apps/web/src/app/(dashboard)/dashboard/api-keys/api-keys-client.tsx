"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/trpc/react"

function KeyCreatedModal({
  name,
  rawKey,
  onClose,
}: {
  name: string
  rawKey: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(rawKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard write failed — silently ignore
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose()
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onKeyDown={handleKeyDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="key-created-title"
        className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2ff]">
          <svg
            className="h-6 w-6 text-[#6366f1]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
            />
          </svg>
        </div>
        <h3 id="key-created-title" className="text-lg font-semibold text-[#0f172a]">
          API Key Created
        </h3>
        <p className="mt-1 text-sm text-[#64748b]">
          Your key <strong>{name}</strong> is ready. Copy it now — you won&apos;t be able to see it
          again.
        </p>
        <div className="mt-4 rounded-lg bg-[#0f172a] p-3">
          <code className="break-all text-xs text-[#e2e8f0]">{rawKey}</code>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4f46e5]"
          >
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
          <button
            onClick={onClose}
            className="text-sm font-medium text-[#64748b] hover:text-[#0f172a]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
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

export function ApiKeysClient() {
  const router = useRouter()
  const utils = api.useUtils()
  const [showNew, setShowNew] = useState(false)
  const [createdKey, setCreatedKey] = useState<{ name: string; rawKey: string } | null>(null)

  const { data: keys, isLoading } = api.apiKey.list.useQuery()
  const deleteKey = api.apiKey.delete.useMutation({
    onSuccess: () => {
      utils.apiKey.list.invalidate()
      router.refresh()
    },
  })

  function handleDelete(id: string, name: string) {
    if (confirm(`Delete API key "${name}"? This action cannot be undone.`)) {
      deleteKey.mutate({ id })
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0f172a]">API Keys</h1>
          <p className="mt-1 text-sm text-[#64748b]">
            Manage API keys for programmatic access to your agents.
          </p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
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
          New key
        </button>
      </div>

      {showNew && (
        <NewKeyForm
          onCreated={(name, rawKey) => {
            setShowNew(false)
            setCreatedKey({ name, rawKey })
          }}
        />
      )}

      {createdKey && (
        <KeyCreatedModal
          name={createdKey.name}
          rawKey={createdKey.rawKey}
          onClose={() => setCreatedKey(null)}
        />
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-[#94a3b8]">Loading...</p>
        </div>
      ) : !keys || keys.length === 0 ? (
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
                d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-[#0f172a]">No API keys yet</h3>
          <p className="mt-1 text-sm text-[#64748b]">
            Create an API key to start integrating with external services.
          </p>
          <button
            onClick={() => setShowNew(true)}
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
            Create your first key
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <div
              key={key.id}
              className="group flex items-center gap-4 rounded-xl border border-[#e2e8f0] bg-white p-4 transition-shadow hover:shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef2ff] text-[#6366f1]">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#0f172a]">{key.name}</span>
                  <code className="rounded bg-[#f1f5f9] px-1.5 py-0.5 font-mono text-xs text-[#64748b]">
                    {key.keyPrefix}...
                  </code>
                </div>
                <p className="mt-0.5 text-xs text-[#94a3b8]">
                  Created {timeAgo(key.createdAt)} · {key.scopes.join(", ")}
                  {key.expiresAt && ` · Expires ${new Date(key.expiresAt).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center gap-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                <button
                  onClick={() => handleDelete(key.id, key.name)}
                  disabled={deleteKey.isPending}
                  className="text-xs font-medium text-[#ef4444] hover:text-[#dc2626]"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NewKeyForm({ onCreated }: { onCreated: (name: string, rawKey: string) => void }) {
  const utils = api.useUtils()
  const [name, setName] = useState("")
  const [scopes, setScopes] = useState<string[]>(["read"])
  const [workspaceId, setWorkspaceId] = useState<string>("")

  const { data: workspaces } = api.workspace.list.useQuery()
  const createKey = api.apiKey.create.useMutation({
    onSuccess: (result) => {
      utils.apiKey.list.invalidate()
      onCreated(result.name, result.rawKey)
      setName("")
      setScopes(["read"])
    },
  })

  function toggleScope(scope: string) {
    setScopes((prev) => (prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !workspaceId || scopes.length === 0) return
    createKey.mutate({ workspaceId, name, scopes: scopes as ("read" | "write" | "admin")[] })
  }

  const wsList = workspaces?.map(({ workspaces: ws }) => ws) ?? []

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-[#e2e8f0] bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold text-[#0f172a]">Create API Key</h3>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="key-workspace"
            className="mb-1.5 block text-sm font-medium text-[#0f172a]"
          >
            Workspace
          </label>
          <select
            id="key-workspace"
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            className="block w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
            required
          >
            <option value="">Select workspace</option>
            {wsList.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="key-name" className="mb-1.5 block text-sm font-medium text-[#0f172a]">
            Name
          </label>
          <input
            id="key-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
            placeholder="Production API Key"
            required
          />
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-[#0f172a]">Scopes</span>
          <div className="flex gap-3">
            {["read", "write", "admin"].map((scope) => (
              <label key={scope} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={scopes.includes(scope)}
                  onChange={() => toggleScope(scope)}
                  className="rounded border-[#e2e8f0] text-[#6366f1] focus:ring-[#6366f1]"
                />
                {scope.charAt(0).toUpperCase() + scope.slice(1)}
              </label>
            ))}
          </div>
        </div>
      </div>

      {createKey.error && <p className="mt-3 text-sm text-[#ef4444]">{createKey.error.message}</p>}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={createKey.isPending || !name || !workspaceId || scopes.length === 0}
          className="rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4f46e5] disabled:opacity-50"
        >
          {createKey.isPending ? "Creating..." : "Create key"}
        </button>
      </div>
    </form>
  )
}
