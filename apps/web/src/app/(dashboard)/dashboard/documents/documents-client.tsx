"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Globe, FileText, Plus, Trash2, Loader2 } from "lucide-react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

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

const statusConfig: Record<
  string,
  { variant: "success" | "warning" | "danger" | "neutral"; label: string }
> = {
  ready: { variant: "success", label: "Ready" },
  processing: { variant: "warning", label: "Processing" },
  failed: { variant: "danger", label: "Failed" },
  pending: { variant: "neutral", label: "Pending" },
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
  return type === "website" ? <Globe className="h-5 w-5" /> : <FileText className="h-5 w-5" />
}

function UploadForm({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isIngesting, setIsIngesting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    if (!title || !content) return
    createDoc.mutate({ title, sourceType: "markdown", metadata: {} })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-surface border-border rounded-lg border p-6">
        <h2 className="text-text-primary text-sm font-medium">Manual Upload</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="doc-title"
              className="text-text-primary mb-1.5 block text-sm font-medium"
            >
              Title
            </label>
            <Input
              id="doc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
          {error && <p className="text-danger-text text-sm">{error}</p>}
          {createDoc.error && <p className="text-danger-text text-sm">{createDoc.error.message}</p>}
        </div>
        <Button
          className="mt-4"
          type="submit"
          disabled={createDoc.isPending || isIngesting || !title || !content}
        >
          {createDoc.isPending ? "Creating..." : isIngesting ? "Processing..." : "Upload & process"}
        </Button>
      </div>
    </form>
  )
}

function WebsiteCrawlForm({ onDone }: { onDone: () => void }) {
  const [url, setUrl] = useState("")
  const [maxPages, setMaxPages] = useState(50)
  const [maxDepth, setMaxDepth] = useState(2)
  const [isCrawling, setIsCrawling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createDoc = api.document.create.useMutation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url) return
    setIsCrawling(true)
    setError(null)
    try {
      const doc = await createDoc.mutateAsync({
        title: url,
        sourceType: "website",
        sourceUrl: url,
        metadata: {},
      })
      const res = await fetch("/api/documents/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: doc.id, sourceUrl: url, maxPages, maxDepth }),
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
    <form onSubmit={handleSubmit}>
      <div className="bg-surface border-border rounded-lg border p-6">
        <h2 className="text-text-primary text-sm font-medium">Crawl Website</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="crawl-url"
              className="text-text-primary mb-1.5 block text-sm font-medium"
            >
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="max-pages"
                className="text-text-primary mb-1.5 block text-sm font-medium"
              >
                Max pages
              </label>
              <Input
                id="max-pages"
                type="number"
                min={1}
                max={500}
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
              />
            </div>
            <div>
              <label
                htmlFor="max-depth"
                className="text-text-primary mb-1.5 block text-sm font-medium"
              >
                Max depth
              </label>
              <Input
                id="max-depth"
                type="number"
                min={1}
                max={5}
                value={maxDepth}
                onChange={(e) => setMaxDepth(Number(e.target.value))}
              />
            </div>
          </div>
          {error && <p className="text-danger-text text-sm">{error}</p>}
        </div>
        <Button className="mt-4" type="submit" disabled={isCrawling || !url}>
          {isCrawling ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              Crawling...
            </>
          ) : (
            <>
              <Globe className="mr-1.5 h-4 w-4" />
              Start crawl
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export function DocumentsClient({ documents: initial }: { documents: Document[] }) {
  const router = useRouter()
  const utils = api.useUtils()
  const [showUpload, setShowUpload] = useState(false)
  const [uploadMode, setUploadMode] = useState<"manual" | "website">("manual")
  const [search, setSearch] = useState("")

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

  const filtered = initial.filter((doc) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (doc.title ?? "").toLowerCase().includes(q) ||
      doc.sourceType.toLowerCase().includes(q) ||
      doc.status.toLowerCase().includes(q)
    )
  })

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-text-primary font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            Documents
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            Upload and manage knowledge base documents for your agents.
          </p>
        </div>
        <Button
          onClick={() => {
            setShowUpload(!showUpload)
            setUploadMode("manual")
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Upload
        </Button>
      </div>

      {showUpload && (
        <div className="space-y-4">
          <div className="bg-surface border-border flex rounded-lg border p-1">
            <button
              onClick={() => setUploadMode("manual")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                uploadMode === "manual"
                  ? "bg-surface-elevated text-text-primary"
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
                  ? "bg-surface-elevated text-text-primary"
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

      <div className="relative">
        <Input
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
        <svg
          className="text-text-muted absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {initial.length === 0 ? (
        <div className="bg-surface border-border rounded-lg border py-16 text-center">
          <div className="bg-accent-subtle text-accent mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-text-primary text-sm font-medium">No documents yet</h3>
          <p className="text-text-muted mt-1 text-sm">
            Upload documents or crawl a website to build a knowledge base.
          </p>
          <Button
            className="mt-6"
            onClick={() => {
              setShowUpload(true)
              setUploadMode("manual")
            }}
          >
            Upload your first document
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface border-border rounded-lg border py-12 text-center">
          <FileText className="text-text-muted mx-auto mb-3 h-8 w-8" />
          <p className="text-text-primary text-sm font-medium">No results found</p>
          <p className="text-text-muted mt-1 text-xs">Try a different search term.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((doc) => {
            const config = statusConfig[doc.status] ?? {
              variant: "neutral" as const,
              label: doc.status,
            }
            return (
              <div
                key={doc.id}
                className="bg-surface border-border hover:bg-surface-hover group flex items-center gap-4 rounded-lg border p-4 transition-colors"
              >
                <div className="bg-accent-subtle text-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <SourceIcon type={doc.sourceType} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-text-primary truncate text-sm font-medium">
                      {doc.title || "Untitled"}
                    </span>
                    <Badge variant={config.variant} className="text-[10px]">
                      {config.label}
                    </Badge>
                    <span className="text-text-muted hidden text-xs sm:inline">
                      {doc.sourceType}
                    </span>
                  </div>
                  <p className="text-text-muted mt-0.5 flex items-center gap-1 text-xs">
                    Uploaded {timeAgo(doc.createdAt)}
                    {doc.sourceUrl && (
                      <>
                        <span>&middot;</span>
                        <span className="truncate">{doc.sourceUrl}</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                  <Button
                    variant="danger"
                    size="xs"
                    onClick={() => handleDelete(doc.id, doc.title ?? "")}
                    disabled={deleteDoc.isPending}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
