"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/trpc/react"

type Document = {
  id: string
  workspaceId: string
  sourceType: string
  sourceUrl: string | null
  title: string | null
  status: string
  errorMessage: string | null
  createdAt: Date
  updatedAt: Date
}

function statusColor(status: string) {
  switch (status) {
    case "ready":
      return "bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]"
    case "processing":
      return "bg-[#fffbeb] text-[#d97706] border-[#fde68a]"
    case "failed":
      return "bg-[#fef2f2] text-[#ef4444] border-[#fecaca]"
    default:
      return "bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]"
  }
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

export function DocumentsClient({ documents: initial }: { documents: Document[] }) {
  const router = useRouter()
  const utils = api.useUtils()
  const [showUpload, setShowUpload] = useState(false)

  const deleteDoc = api.document.delete.useMutation({
    onSuccess: () => {
      utils.document.list.invalidate()
      router.refresh()
    },
  })

  function handleDelete(id: string, title: string) {
    if (confirm(`Delete "${title || "Untitled"}"?`)) {
      deleteDoc.mutate({ id })
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0f172a]">Documents</h1>
          <p className="mt-1 text-sm text-[#64748b]">
            Upload and manage knowledge base documents for your agents.
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
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
          Upload
        </button>
      </div>

      {showUpload && (
        <UploadForm
          onDone={() => {
            setShowUpload(false)
            utils.document.list.invalidate()
          }}
        />
      )}

      {initial.length === 0 ? (
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
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-[#0f172a]">No documents yet</h3>
          <p className="mt-1 text-sm text-[#64748b]">
            Upload documents to build a knowledge base for your agents.
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4f46e5]"
          >
            Upload your first document
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {initial.map((doc) => (
            <div
              key={doc.id}
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
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#0f172a]">
                    {doc.title || "Untitled"}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor(doc.status)}`}
                  >
                    {doc.status}
                  </span>
                  <span className="text-xs text-[#94a3b8]">{doc.sourceType}</span>
                </div>
                <p className="mt-0.5 text-xs text-[#94a3b8]">
                  Uploaded {timeAgo(doc.createdAt)}
                  {doc.sourceUrl && ` · ${doc.sourceUrl}`}
                </p>
              </div>
              <div className="flex items-center gap-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                <button
                  onClick={() => handleDelete(doc.id, doc.title ?? "")}
                  disabled={deleteDoc.isPending}
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

function UploadForm({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [workspaceId, setWorkspaceId] = useState("")
  const [isIngesting, setIsIngesting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: workspaces } = api.workspace.list.useQuery()
  const createDoc = api.document.create.useMutation({
    onSuccess: async (doc) => {
      setIsIngesting(true)
      setError(null)

      try {
        const res = await fetch("/api/documents/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId: doc.id, content }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Ingestion failed")
        }

        onDone()
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setIsIngesting(false)
      }
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !content || !workspaceId) return
    createDoc.mutate({
      workspaceId,
      title,
      sourceType: "markdown",
      metadata: {},
    })
  }

  const wsList = workspaces?.map(({ workspaces: ws }) => ws) ?? []

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-[#e2e8f0] bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold text-[#0f172a]">Upload Document</h3>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="doc-workspace"
            className="mb-1.5 block text-sm font-medium text-[#0f172a]"
          >
            Workspace
          </label>
          <select
            id="doc-workspace"
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
          <label htmlFor="doc-title" className="mb-1.5 block text-sm font-medium text-[#0f172a]">
            Title
          </label>
          <input
            id="doc-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
            placeholder="Product FAQ"
            required
          />
        </div>

        <div>
          <label htmlFor="doc-content" className="mb-1.5 block text-sm font-medium text-[#0f172a]">
            Content
          </label>
          <textarea
            id="doc-content"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="block w-full resize-y rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
            placeholder="Paste or type your document content here..."
            required
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-[#ef4444]">{error}</p>}
      {createDoc.error && <p className="mt-3 text-sm text-[#ef4444]">{createDoc.error.message}</p>}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={createDoc.isPending || isIngesting || !title || !content || !workspaceId}
          className="rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4f46e5] disabled:opacity-50"
        >
          {createDoc.isPending ? "Creating..." : isIngesting ? "Processing..." : "Upload & process"}
        </button>
      </div>
    </form>
  )
}
