"use client"

import { useState } from "react"
import { api } from "@/trpc/react"
import { useRouter } from "next/navigation"

type Workspace = {
  id: string
  name: string
  slug: string
  createdAt: Date
}

type WorkspaceWithMembership = {
  workspaces: Workspace
  memberships: { id: string; role: string }
}

export function DashboardClient({
  workspaces: initial,
}: {
  workspaces: WorkspaceWithMembership[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const router = useRouter()
  const utils = api.useUtils()

  const createWorkspace = api.workspace.create.useMutation({
    onSuccess: () => {
      utils.workspace.list.invalidate()
      setShowForm(false)
      setName("")
      router.refresh()
    },
  })

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return
    createWorkspace.mutate({ name, slug: generateSlug(name) })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          {showForm ? "Cancel" : "Create workspace"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-md border p-4 space-y-3"
        >
          <div>
            <label htmlFor="ws-name" className="block text-sm font-medium">
              Workspace name
            </label>
            <input
              id="ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
              placeholder="My Workspace"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Slug: {name ? generateSlug(name) : "my-workspace"}
            </p>
          </div>
          {createWorkspace.error && (
            <p className="text-sm text-red-600">{createWorkspace.error.message}</p>
          )}
          <button
            type="submit"
            disabled={createWorkspace.isPending}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {createWorkspace.isPending ? "Creating..." : "Create"}
          </button>
        </form>
      )}

      {initial.length === 0 ? (
        <p className="text-gray-500">
          No workspaces yet. Create one to get started.
        </p>
      ) : (
        <div className="space-y-3">
          {initial.map(({ workspaces: ws }) => (
            <div
              key={ws.id}
              className="rounded-md border p-4"
            >
              <h2 className="font-medium">{ws.name}</h2>
              <p className="text-sm text-gray-500">{ws.slug}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
