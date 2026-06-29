"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/trpc/react"
import { Globe, FileText, Plus } from "lucide-react"

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
      return "border-[#166534] bg-[#052e16] text-[#86efac]"
    case "processing":
      return "border-[#92400e] bg-[#451a03] text-[#fcd34d]"
    case "failed":
      return "border-[#991b1b] bg-[#450a0a] text-[#fca5a5]"
    default:
      return "border-border bg-surface-elevated text-text-tertiary"
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

function SourceIcon({ type }: { type: string }) {
  if (type === "website") {
    return <Globe className="h-5 w-5" />
  }
  return <FileText className="h-5 w-5" />
}

export function DocumentsClient({ documents: initial }: { documents: Document[] }) {
  const router = useRouter()
  const utils = api.useUtils()
  const [showUpload, setShowUpload] = useState(false)
  const [uploadMode, setUploadMode] = useState<"manual" | "website">("manual")

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
          <h1 className="text-text-primary text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="text-text-tertiary mt-1 text-sm">
            Upload and manage knowledge base documents for your agents.
          </p>
        </div>
        <button
          onClick={() => {
            setShowUpload(!showUpload)
            setUploadMode("manual")
          }}
          className="bg-accent text-accent-text hover:bg-accent-strong inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Upload
        </button>
      </div>

      {showUpload && (
        <div className="mb-8">
          <div className="border-border mb-4 flex rounded-lg border p-1">
            <button
              onClick={() => setUploadMode("manual")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                uploadMode === "manual"
                  ? "bg-surface-active text-text-primary"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              <FileText className="h-4 w-4" />
              Manual
            </button>
            <button
              onClick={() => setUploadMode("website")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                uploadMode === "website"
                  ? "bg-surface-active text-text-primary"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              <Globe className="h-4 w-4" />
              Website
            </button>
          </div>
          {uploadMode === "manual" ? (
            <UploadForm
              onDone={() => {
                setShowUpload(false)
                utils.document.list.invalidate()
              }}
            />
          ) : (
            <WebsiteCrawlForm
              onDone={() => {
                setShowUpload(false)
                utils.document.list.invalidate()
              }}
            />
          )}
        </div>
      )}

      {initial.length === 0 ? (
        <div className="border-border bg-surface flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-16">
          <div className="bg-accent-subtle text-accent mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-text-primary text-base font-semibold">No documents yet</h3>
          <p className="text-text-tertiary mt-1 text-sm">
            Upload documents or crawl a website to build a knowledge base.
          </p>
          <button
            onClick={() => {
              setShowUpload(true)
              setUploadMode("manual")
            }}
            className="bg-accent text-accent-text hover:bg-accent-strong mt-4 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            Upload your first document
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {initial.map((doc) => (
            <div
              key={doc.id}
              className="border-border bg-surface group flex items-center gap-4 rounded-xl border p-4 transition-shadow hover:shadow-sm"
            >
              <div className="bg-accent-subtle text-accent flex h-10 w-10 items-center justify-center rounded-lg">
                <SourceIcon type={doc.sourceType} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-text-primary text-sm font-medium">
                    {doc.title || "Untitled"}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor(doc.status)}`}
                  >
                    {doc.status}
                  </span>
                  <span className="text-text-muted text-xs">{doc.sourceType}</span>
                </div>
                <p className="text-text-muted mt-0.5 flex items-center gap-1 text-xs">
                  Uploaded {timeAgo(doc.createdAt)}
                  {doc.sourceUrl && (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-0.5">{doc.sourceUrl}</span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                <button
                  onClick={() => handleDelete(doc.id, doc.title ?? "")}
                  disabled={deleteDoc.isPending}
                  className="text-danger hover:text-danger-text text-xs font-medium"
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
    <form onSubmit={handleSubmit} className="border-border bg-surface rounded-xl border p-6">
      <h3 className="text-text-primary mb-4 text-sm font-semibold">Manual Upload</h3>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="doc-workspace"
            className="text-text-primary mb-1.5 block text-sm font-medium"
          >
            Workspace
          </label>
          <select
            id="doc-workspace"
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
          <label htmlFor="doc-title" className="text-text-primary mb-1.5 block text-sm font-medium">
            Title
          </label>
          <input
            id="doc-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
            placeholder="Product FAQ"
            required
          />
        </div>

        <div>
          <label
            htmlFor="doc-content"
            className="text-text-primary mb-1.5 block text-sm font-medium"
          >
            Content
          </label>
          <textarea
            id="doc-content"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full resize-y rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
            placeholder="Paste or type your document content here..."
            required
          />
        </div>
      </div>

      {error && <p className="text-danger-text mt-3 text-sm">{error}</p>}
      {createDoc.error && (
        <p className="text-danger-text mt-3 text-sm">{createDoc.error.message}</p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={createDoc.isPending || isIngesting || !title || !content || !workspaceId}
          className="bg-accent text-accent-text hover:bg-accent-strong inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {createDoc.isPending ? "Creating..." : isIngesting ? "Processing..." : "Upload & process"}
        </button>
      </div>
    </form>
  )
}

function WebsiteCrawlForm({ onDone }: { onDone: () => void }) {
  const [url, setUrl] = useState("")
  const [maxPages, setMaxPages] = useState(50)
  const [maxDepth, setMaxDepth] = useState(2)
  const [workspaceId, setWorkspaceId] = useState("")
  const [isCrawling, setIsCrawling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: workspaces } = api.workspace.list.useQuery()
  const createDoc = api.document.create.useMutation()

  const wsList = workspaces?.map(({ workspaces: ws }) => ws) ?? []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url || !workspaceId) return
    setIsCrawling(true)
    setError(null)

    try {
      const doc = await createDoc.mutateAsync({
        workspaceId,
        title: url,
        sourceType: "website",
        sourceUrl: url,
        metadata: {},
      })

      const res = await fetch("/api/documents/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: doc.id,
          sourceUrl: url,
          maxPages,
          maxDepth,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Crawl failed")
      }

      onDone()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsCrawling(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-border bg-surface rounded-xl border p-6">
      <h3 className="text-text-primary mb-4 text-sm font-semibold">Crawl Website</h3>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="crawl-workspace"
            className="text-text-primary mb-1.5 block text-sm font-medium"
          >
            Workspace
          </label>
          <select
            id="crawl-workspace"
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
          <label htmlFor="crawl-url" className="text-text-primary mb-1.5 block text-sm font-medium">
            Website URL
          </label>
          <div className="relative">
            <Globe className="text-text-muted absolute left-3 top-2.5 h-4 w-4" />
            <input
              id="crawl-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border py-2 pl-10 pr-3 text-sm outline-none focus:ring-1"
              placeholder="https://docs.example.com"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="max-pages"
              className="text-text-primary mb-1.5 block text-sm font-medium"
            >
              Max pages
            </label>
            <input
              id="max-pages"
              type="number"
              min={1}
              max={500}
              value={maxPages}
              onChange={(e) => setMaxPages(Number(e.target.value))}
              className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
            />
          </div>
          <div>
            <label
              htmlFor="max-depth"
              className="text-text-primary mb-1.5 block text-sm font-medium"
            >
              Max depth
            </label>
            <input
              id="max-depth"
              type="number"
              min={1}
              max={5}
              value={maxDepth}
              onChange={(e) => setMaxDepth(Number(e.target.value))}
              className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-danger-text mt-3 text-sm">{error}</p>}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={isCrawling || !url || !workspaceId}
          className="bg-accent text-accent-text hover:bg-accent-strong inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isCrawling ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Crawling...
            </>
          ) : (
            <>
              <Globe className="h-4 w-4" />
              Start crawl
            </>
          )}
        </button>
      </div>
    </form>
  )
}
