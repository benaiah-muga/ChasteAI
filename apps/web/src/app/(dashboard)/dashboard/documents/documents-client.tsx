"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Globe, FileText, Plus, Trash2, Loader2 } from "lucide-react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

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
    createDoc.mutate({ workspaceId, title, sourceType: "markdown", metadata: {} })
  }

  const wsList = workspaces?.map(({ workspaces: ws }) => ws) ?? []

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Manual Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
          {error && <p className="text-danger text-sm">{error}</p>}
          {createDoc.error && <p className="text-danger text-sm">{createDoc.error.message}</p>}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={createDoc.isPending || isIngesting || !title || !content || !workspaceId}
          >
            {createDoc.isPending
              ? "Creating..."
              : isIngesting
                ? "Processing..."
                : "Upload & process"}
          </Button>
        </CardFooter>
      </Card>
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
      <Card>
        <CardHeader>
          <CardTitle>Crawl Website</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <div className="grid grid-cols-2 gap-4">
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
          {error && <p className="text-danger text-sm">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isCrawling || !url || !workspaceId}>
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
        </CardFooter>
      </Card>
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-text-primary text-lg font-semibold tracking-tight">Documents</h1>
          <p className="text-text-tertiary mt-0.5 text-xs">
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
          <div className="border-border flex rounded-lg border p-1">
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

      <div className="relative">
        <input
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-border bg-bg text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-accent w-full rounded-lg border px-3 py-2 pl-9 text-sm outline-none focus:ring-1"
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
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="bg-accent-subtle text-accent mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <FileText className="h-6 w-6" />
            </div>
            <CardTitle className="mb-1">No documents yet</CardTitle>
            <CardDescription className="mb-6">
              Upload documents or crawl a website to build a knowledge base.
            </CardDescription>
            <Button
              onClick={() => {
                setShowUpload(true)
                setUploadMode("manual")
              }}
            >
              Upload your first document
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <FileText className="text-text-muted mb-3 h-8 w-8" />
            <p className="text-text-primary text-sm font-medium">No results found</p>
            <p className="text-text-tertiary mt-1 text-xs">Try a different search term.</p>
          </CardContent>
        </Card>
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
                className="border-border bg-surface hover:bg-surface-hover group flex items-center gap-4 rounded-xl border p-4 transition-colors"
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
