"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Key, Copy, Check, Trash2 } from "lucide-react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

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
      // clipboard write failed
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose()
      }}
    >
      <div
        className="bg-surface border-border w-full max-w-lg rounded-lg border p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="key-created-title"
      >
        <div className="bg-accent-subtle text-accent mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <Key className="h-6 w-6" />
        </div>
        <h2
          id="key-created-title"
          className="text-text-primary text-lg font-semibold tracking-tight"
        >
          API Key Created
        </h2>
        <p className="text-text-muted mt-1 text-sm">
          Your key <strong className="text-text-primary">{name}</strong> is ready. Copy it now — you
          won&apos;t be able to see it again.
        </p>
        <div className="bg-bg mt-4 rounded-lg p-3">
          <code className="text-text-primary break-all font-mono text-xs">{rawKey}</code>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="mr-1.5 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-4 w-4" />
                Copy to clipboard
              </>
            )}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}

function NewKeyForm({ onCreated }: { onCreated: (name: string, rawKey: string) => void }) {
  const utils = api.useUtils()
  const [name, setName] = useState("")
  const [scopes, setScopes] = useState<string[]>(["read"])

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
    if (!name || scopes.length === 0) return
    createKey.mutate({ name, scopes: scopes as ("read" | "write" | "admin")[] })
  }

  return (
    <div className="bg-surface border-border rounded-lg border p-6">
      <h2 className="text-text-primary text-sm font-medium">Create API Key</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="key-name" className="text-text-primary mb-1.5 block text-sm font-medium">
            Name
          </label>
          <Input
            id="key-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Production API Key"
            required
          />
        </div>
        <div>
          <span className="text-text-primary mb-1.5 block text-sm font-medium">Scopes</span>
          <div className="flex gap-4">
            {["read", "write", "admin"].map((scope) => (
              <label key={scope} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={scopes.includes(scope)}
                  onChange={() => toggleScope(scope)}
                  className="border-border text-accent focus:ring-accent rounded"
                />
                <span className="text-text-primary">
                  {scope.charAt(0).toUpperCase() + scope.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>
        {createKey.error && <p className="text-danger-text text-sm">{createKey.error.message}</p>}
        <Button type="submit" disabled={createKey.isPending || !name || scopes.length === 0}>
          {createKey.isPending ? "Creating..." : "Create key"}
        </Button>
      </form>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="bg-surface border-border flex items-center gap-4 rounded-lg border p-4">
      <div className="bg-surface-elevated h-10 w-10 animate-pulse rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="bg-surface-elevated h-4 w-40 animate-pulse rounded" />
        <div className="bg-surface-elevated h-3 w-56 animate-pulse rounded" />
      </div>
      <div className="bg-surface-elevated h-8 w-16 animate-pulse rounded-lg" />
    </div>
  )
}

export function ApiKeysClient() {
  const router = useRouter()
  const utils = api.useUtils()
  const [showNew, setShowNew] = useState(false)
  const [createdKey, setCreatedKey] = useState<{ name: string; rawKey: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const { data: keys, isLoading } = api.apiKey.list.useQuery()
  const deleteKey = api.apiKey.delete.useMutation({
    onSuccess: () => {
      utils.apiKey.list.invalidate()
      router.refresh()
      setDeleteTarget(null)
    },
  })

  function handleDeleteConfirm() {
    if (deleteTarget) {
      deleteKey.mutate({ id: deleteTarget.id })
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-text-primary font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            API Keys
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            Manage API keys for programmatic access to your agents.
          </p>
        </div>
        <Button onClick={() => setShowNew(!showNew)}>
          <Plus className="mr-1.5 h-4 w-4" />
          New key
        </Button>
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
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : !keys || keys.length === 0 ? (
        <div className="bg-surface border-border rounded-lg border py-16 text-center">
          <div className="bg-accent-subtle text-accent mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Key className="h-6 w-6" />
          </div>
          <h3 className="text-text-primary text-sm font-medium">No API keys yet</h3>
          <p className="text-text-muted mt-1 text-sm">
            Create an API key to start integrating with external services.
          </p>
          <Button className="mt-6" onClick={() => setShowNew(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Create your first key
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <div
              key={key.id}
              className="bg-surface border-border hover:bg-surface-hover group flex items-center gap-4 rounded-lg border p-4 transition-colors"
            >
              <div className="bg-accent-subtle text-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <Key className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-text-primary text-sm font-medium">{key.name}</span>
                  <code className="bg-surface-elevated text-text-muted rounded px-1.5 py-0.5 font-mono text-xs">
                    {key.keyPrefix}...
                  </code>
                </div>
                <p className="text-text-muted mt-0.5 text-xs">
                  Created {timeAgo(key.createdAt)} &middot; {key.scopes.join(", ")}
                  {key.expiresAt && (
                    <> &middot; Expires {new Date(key.expiresAt).toLocaleDateString()}</>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                <Button
                  variant="danger"
                  size="xs"
                  onClick={() => setDeleteTarget({ id: key.id, name: key.name })}
                  disabled={deleteKey.isPending}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.name ?? "API key"}"?`}
        description="This action cannot be undone. Any services using this key will lose access."
        confirmText={deleteTarget?.name ?? "API key"}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteKey.isPending}
      />
    </div>
  )
}
