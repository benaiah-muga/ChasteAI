"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LayoutGrid, Plus, Search, Trash2, Pencil, X, Check } from "lucide-react"
import { api } from "@/trpc/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import type { inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "@/server/api/root"

type RouterOutput = inferRouterOutputs<AppRouter>
type WorkspaceWithMembership = RouterOutput["workspace"]["list"][number]

const roleVariant: Record<string, "success" | "warning" | "neutral" | "muted"> = {
  owner: "success",
  admin: "warning",
  member: "neutral",
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

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function CreateWorkspaceForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const createWorkspace = api.workspace.create.useMutation({
    onSuccess: () => {
      onDone()
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return
    createWorkspace.mutate({
      name,
      slug: generateSlug(name),
      description: description || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-accent border">
        <CardContent className="space-y-4 pt-6">
          <div>
            <label htmlFor="ws-name" className="text-text-primary mb-1.5 block text-sm font-medium">
              Name
            </label>
            <Input
              id="ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Workspace"
              required
            />
            <p className="text-text-muted mt-1 font-mono text-xs">
              Slug: {name ? generateSlug(name) : "my-workspace"}
            </p>
          </div>
          <div>
            <label htmlFor="ws-desc" className="text-text-primary mb-1.5 block text-sm font-medium">
              Description (optional)
            </label>
            <textarea
              id="ws-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
              placeholder="What is this workspace for?"
            />
          </div>
          {createWorkspace.error && (
            <p className="text-danger-text bg-danger-subtle rounded-md px-3 py-2 text-[13px]">
              {createWorkspace.error.message}
            </p>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onDone} type="button">
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={createWorkspace.isPending}>
              Create Workspace
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

function EditWorkspaceForm({
  workspace,
  onDone,
}: {
  workspace: WorkspaceWithMembership["workspaces"]
  onDone: () => void
}) {
  const [name, setName] = useState(workspace.name)
  const [slug, setSlug] = useState(workspace.slug)
  const [description, setDescription] = useState(workspace.description ?? "")

  const updateWorkspace = api.workspace.update.useMutation({
    onSuccess: () => {
      onDone()
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return
    updateWorkspace.mutate({
      id: workspace.id,
      name,
      slug,
      description: description || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="border-border bg-surface rounded-xl border p-4">
        <div className="space-y-3">
          <div>
            <label
              htmlFor={`edit-name-${workspace.id}`}
              className="text-text-primary mb-1 block text-xs font-medium"
            >
              Name
            </label>
            <Input
              id={`edit-name-${workspace.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor={`edit-slug-${workspace.id}`}
              className="text-text-primary mb-1 block text-xs font-medium"
            >
              Slug
            </label>
            <Input
              id={`edit-slug-${workspace.id}`}
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              required
            />
          </div>
          <div>
            <label
              htmlFor={`edit-desc-${workspace.id}`}
              className="text-text-primary mb-1 block text-xs font-medium"
            >
              Description
            </label>
            <textarea
              id={`edit-desc-${workspace.id}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
            />
          </div>
          {updateWorkspace.error && (
            <p className="text-danger-text bg-danger-subtle rounded-md px-3 py-2 text-xs">
              {updateWorkspace.error.message}
            </p>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="xs" onClick={onDone} type="button">
              <X className="mr-1 h-3 w-3" />
              Cancel
            </Button>
            <Button type="submit" size="xs" loading={updateWorkspace.isPending}>
              <Check className="mr-1 h-3 w-3" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

export function WorkspacesClient({
  workspaces: initial,
}: {
  workspaces: WorkspaceWithMembership[]
}) {
  const router = useRouter()
  const utils = api.useUtils()
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const deleteWorkspace = api.workspace.delete.useMutation({
    onSuccess: () => {
      utils.workspace.list.invalidate()
      utils.dashboard.stats.invalidate()
      router.refresh()
      setDeleting(null)
    },
    onError: () => {
      setDeleting(null)
    },
  })

  function handleDelete(id: string, name: string) {
    if (
      confirm(
        `Are you sure you want to delete "${name}"? This will permanently remove all agents, channels, documents, and data in this workspace.`,
      )
    ) {
      setDeleting(id)
      deleteWorkspace.mutate({ id })
    }
  }

  function onMutateDone() {
    setShowForm(false)
    setEditing(null)
    utils.workspace.list.invalidate()
    utils.dashboard.stats.invalidate()
    router.refresh()
  }

  const filtered = initial.filter(({ workspaces: ws }) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      ws.name.toLowerCase().includes(q) ||
      ws.slug.toLowerCase().includes(q) ||
      (ws.description ?? "").toLowerCase().includes(q)
    )
  })

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-text-primary text-2xl font-semibold tracking-tight">Workspaces</h1>
          <p className="text-text-tertiary mt-1 text-sm">
            Manage your workspaces and team collaboration.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1.5 h-4 w-4" />
          {showForm ? "Cancel" : "New Workspace"}
        </Button>
      </div>

      {showForm && <CreateWorkspaceForm onDone={onMutateDone} />}

      {initial.length > 0 && (
        <div className="relative max-w-xs">
          <Search className="text-text-muted absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search workspaces..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {initial.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="bg-accent-subtle text-accent mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <CardTitle className="mb-1">No workspaces yet</CardTitle>
            <CardDescription className="mb-6">
              Create your first workspace to organize agents and channels.
            </CardDescription>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Create your first workspace
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Search className="text-text-muted mb-3 h-8 w-8" />
            <p className="text-text-primary text-sm font-medium">No results found</p>
            <p className="text-text-tertiary mt-1 text-xs">Try a different search term.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(({ workspaces: ws, memberships: ms }) => (
            <div
              key={ws.id}
              className="border-border bg-surface group relative rounded-xl border p-5 transition-shadow hover:shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-text-primary text-sm font-semibold">{ws.name}</h3>
                  <p className="text-text-tertiary mt-0.5 font-mono text-xs">{ws.slug}</p>
                </div>
                <Badge variant={roleVariant[ms.role] ?? "neutral"}>
                  {ms.role.charAt(0).toUpperCase() + ms.role.slice(1)}
                </Badge>
              </div>
              {ws.description && (
                <p className="text-text-tertiary mb-3 line-clamp-2 text-xs leading-relaxed">
                  {ws.description}
                </p>
              )}
              <div className="text-text-muted flex items-center gap-2 text-xs">
                <span>Created {timeAgo(ws.createdAt)}</span>
              </div>
              <div className="border-border mt-4 flex items-center gap-3 border-t pt-3 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                <button
                  onClick={() => setEditing(editing === ws.id ? null : ws.id)}
                  className="text-accent hover:text-accent-strong inline-flex items-center gap-1 text-xs font-medium transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                  {editing === ws.id ? "Cancel" : "Edit"}
                </button>
                <button
                  onClick={() => handleDelete(ws.id, ws.name)}
                  disabled={deleting === ws.id}
                  className="text-danger hover:text-danger-text ml-auto inline-flex items-center gap-1 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                  {deleting === ws.id ? "Deleting..." : "Delete"}
                </button>
              </div>
              {editing === ws.id && (
                <div className="mt-3">
                  <EditWorkspaceForm workspace={ws} onDone={onMutateDone} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
