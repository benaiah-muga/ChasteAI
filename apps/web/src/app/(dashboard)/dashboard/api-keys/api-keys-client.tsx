"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Key, Copy, Check, Trash2 } from "lucide-react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

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
      <Card
        className="w-full max-w-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="key-created-title"
      >
        <CardHeader>
          <div className="bg-accent-subtle text-accent mb-3 flex h-12 w-12 items-center justify-center rounded-full">
            <Key className="h-6 w-6" />
          </div>
          <CardTitle id="key-created-title">API Key Created</CardTitle>
          <CardDescription>
            Your key <strong>{name}</strong> is ready. Copy it now — you won&apos;t be able to see
            it again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-bg rounded-lg p-3">
            <code className="text-text-primary break-all text-xs">{rawKey}</code>
          </div>
        </CardContent>
        <CardFooter className="flex items-center gap-3">
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
          <Button variant="subtle" onClick={onClose}>
            Done
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function NewKeyForm({ onCreated }: { onCreated: (name: string, rawKey: string) => void }) {
  const utils = api.useUtils()
  const [name, setName] = useState("")
  const [scopes, setScopes] = useState<string[]>(["read"])
  const [workspaceId, setWorkspaceId] = useState("")

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
    <Card>
      <CardHeader>
        <CardTitle>Create API Key</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <label
              htmlFor="key-workspace"
              className="text-text-primary mb-1.5 block text-sm font-medium"
            >
              Workspace
            </label>
            <select
              id="key-workspace"
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
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
            <label
              htmlFor="key-name"
              className="text-text-primary mb-1.5 block text-sm font-medium"
            >
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
          {createKey.error && <p className="text-danger text-sm">{createKey.error.message}</p>}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={createKey.isPending || !name || !workspaceId || scopes.length === 0}
          >
            {createKey.isPending ? "Creating..." : "Create key"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

function SkeletonRow() {
  return (
    <div className="border-border bg-surface flex items-center gap-4 rounded-xl border p-4">
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-text-primary text-lg font-semibold tracking-tight">API Keys</h1>
          <p className="text-text-tertiary mt-0.5 text-xs">
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
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="bg-accent-subtle text-accent mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <Key className="h-6 w-6" />
            </div>
            <CardTitle className="mb-1">No API keys yet</CardTitle>
            <CardDescription className="mb-6">
              Create an API key to start integrating with external services.
            </CardDescription>
            <Button onClick={() => setShowNew(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Create your first key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <div
              key={key.id}
              className="border-border bg-surface hover:bg-surface-hover group flex items-center gap-4 rounded-xl border p-4 transition-colors"
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
                  onClick={() => handleDelete(key.id, key.name)}
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
    </div>
  )
}
