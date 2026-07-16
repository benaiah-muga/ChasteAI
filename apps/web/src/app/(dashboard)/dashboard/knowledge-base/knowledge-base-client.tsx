"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Globe,
  FileText,
  Plus,
  Trash2,
  Loader2,
  Upload,
  RefreshCw,
  CalendarClock,
} from "lucide-react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

type Document = {
  id: string
  workspaceId: string
  sourceType: string
  sourceUrl: string | null
  title: string | null
  status: string
  errorMessage: string | null
  metadata: Record<string, unknown> | null
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
  const [file, setFile] = useState<File | null>(null)
  const [isIngesting, setIsIngesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createDoc = api.document.create.useMutation({
    onSuccess: async (doc) => {
      setIsIngesting(true)
      setError(null)
      try {
        const body = file ? await file.text() : content
        const res = await fetch("/api/documents/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId: doc.id, content: body }),
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
    if (!title) return
    if (!content && !file) return
    createDoc.mutate({
      title,
      sourceType: (file?.name ?? "").endsWith(".pdf") ? "pdf" : "markdown",
      metadata: {},
    })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) {
      setFile(f)
      setTitle(f.name.replace(/\.[^/.]+$/, ""))
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-surface border-border rounded-lg border p-6">
        <h2 className="text-text-primary text-sm font-medium">Upload Document</h2>
        <p className="text-text-muted mt-1 text-xs">
          Upload a text file, PDF, or paste content directly.
        </p>
        <div className="mt-4 space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-border hover:border-accent relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {file ? (
              <div className="space-y-2">
                <FileText className="text-accent mx-auto h-8 w-8" />
                <p className="text-text-primary text-sm font-medium">{file.name}</p>
                <p className="text-text-muted text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                  }}
                  className="text-danger-text hover:text-danger text-xs underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="text-text-muted mx-auto h-8 w-8" />
                <p className="text-text-primary text-sm font-medium">
                  Drop a file here, or click to browse
                </p>
                <p className="text-text-muted text-xs">Supports .txt, .md, .pdf (up to 1 MB)</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) {
                  setFile(f)
                  setTitle(f.name.replace(/\.[^/.]+$/, ""))
                }
              }}
            />
          </div>

          {!file && (
            <div>
              <label className="text-text-primary mb-1.5 block text-sm font-medium">
                Or paste content
              </label>
              <textarea
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full resize-y rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
                placeholder="Paste or type your document content here..."
              />
            </div>
          )}

          <div>
            <label className="text-text-primary mb-1.5 block text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Product FAQ"
              required
            />
          </div>

          {error && <p className="text-danger-text text-sm">{error}</p>}
          {createDoc.error && <p className="text-danger-text text-sm">{createDoc.error.message}</p>}
        </div>
        <Button
          className="mt-4"
          type="submit"
          disabled={createDoc.isPending || isIngesting || !title || (!content && !file)}
        >
          {createDoc.isPending ? "Creating..." : isIngesting ? "Processing..." : "Upload & Process"}
        </Button>
      </div>
    </form>
  )
}

function WebsiteCrawlForm({ onDone }: { onDone: () => void }) {
  const [url, setUrl] = useState("")
  const [maxPages, setMaxPages] = useState(50)
  const [maxDepth, setMaxDepth] = useState(2)
  const [includePattern, setIncludePattern] = useState("")
  const [excludePattern, setExcludePattern] = useState("")
  const [isCrawling, setIsCrawling] = useState(false)
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createDoc = api.document.create.useMutation()

  const { data: pollDoc } = api.document.getById.useQuery(
    { id: documentId! },
    { enabled: !!documentId && isCrawling, refetchInterval: 3000 },
  )

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
        metadata: { crawlProgress: { visited: 0, total: 0, currentUrl: url } },
      })
      setDocumentId(doc.id)
      const res = await fetch("/api/documents/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: doc.id,
          sourceUrl: url,
          maxPages,
          maxDepth,
          includePattern: includePattern || undefined,
          excludePattern: excludePattern || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Crawl failed")
      }
    } catch (e) {
      setError((e as Error).message)
      setIsCrawling(false)
    }
  }

  const done = pollDoc?.document.status === "ready" || pollDoc?.document.status === "failed"

  if (done) {
    onDone()
    return null
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-surface border-border rounded-lg border p-6">
        <h2 className="text-text-primary text-sm font-medium">Crawl Website</h2>
        <p className="text-text-muted mt-1 text-xs">
          Crawl a website and index its pages as knowledge base content. Supports scheduled
          re-crawls to keep content up to date.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-text-primary mb-1.5 block text-sm font-medium">
              Website URL
            </label>
            <div className="relative">
              <Globe className="text-text-muted absolute left-3 top-2.5 h-4 w-4" />
              <input
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
              <label className="text-text-primary mb-1.5 block text-sm font-medium">
                Max pages
              </label>
              <Input
                type="number"
                min={1}
                max={500}
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-text-primary mb-1.5 block text-sm font-medium">
                Max depth
              </label>
              <Input
                type="number"
                min={1}
                max={5}
                value={maxDepth}
                onChange={(e) => setMaxDepth(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-text-primary mb-1.5 block text-sm font-medium">
                Include pattern
              </label>
              <Input
                value={includePattern}
                onChange={(e) => setIncludePattern(e.target.value)}
                placeholder="e.g. docs/guides/*"
              />
            </div>
            <div>
              <label className="text-text-primary mb-1.5 block text-sm font-medium">
                Exclude pattern
              </label>
              <Input
                value={excludePattern}
                onChange={(e) => setExcludePattern(e.target.value)}
                placeholder="e.g. docs/api/*"
              />
            </div>
          </div>

          {pollDoc && isCrawling && (
            <div className="bg-surface-elevated rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="text-accent h-4 w-4 animate-spin" />
                <span className="text-text-primary text-sm font-medium">Crawling...</span>
              </div>
              {(() => {
                const prog = pollDoc.document.metadata?.crawlProgress as
                  | { visited: number; total: number; currentUrl?: string }
                  | undefined
                if (!prog) return null
                return (
                  <>
                    <div className="mt-3">
                      <div className="bg-bg h-2 w-full overflow-hidden rounded-full">
                        <div
                          className="bg-accent h-full rounded-full transition-all"
                          style={{
                            width: prog.total > 0 ? `${(prog.visited / prog.total) * 100}%` : "5%",
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-text-muted mt-2 text-xs tabular-nums">
                      {prog.visited} / {prog.total || "?"} pages
                      {prog.currentUrl && (
                        <>
                          {" "}
                          &middot; <span className="truncate">{prog.currentUrl}</span>
                        </>
                      )}
                    </p>
                  </>
                )
              })()}
            </div>
          )}

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

export function KnowledgeBaseClient({ documents: initial }: { documents: Document[] }) {
  const router = useRouter()
  const utils = api.useUtils()
  const [showUpload, setShowUpload] = useState(false)
  const [uploadMode, setUploadMode] = useState<"manual" | "website">("manual")
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null)

  const deleteDoc = api.document.delete.useMutation({
    onSuccess: () => {
      utils.document.list.invalidate()
      router.refresh()
      setDeleteTarget(null)
    },
  })

  const filtered = initial.filter((doc) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (doc.title ?? "").toLowerCase().includes(q) ||
      doc.sourceType.toLowerCase().includes(q) ||
      doc.status.toLowerCase().includes(q) ||
      (doc.sourceUrl ?? "").toLowerCase().includes(q)
    )
  })

  const documents = filtered.filter((d) => d.sourceType !== "website")
  const websites = filtered.filter((d) => d.sourceType === "website")

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-text-primary font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            Knowledge Base
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            Upload documents or crawl websites to build a knowledge base for your agents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/dashboard/knowledge-base/crawls")}
          >
            <CalendarClock className="mr-1.5 h-4 w-4" />
            Crawls
          </Button>
          <Button
            onClick={() => {
              setShowUpload(!showUpload)
              setUploadMode("manual")
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add
          </Button>
        </div>
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
              Documents
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
              Websites
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
          placeholder="Search knowledge base..."
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

      <div className="border-border flex gap-2 border-b">
        <button className="text-text-primary border-accent -mb-px border-b-2 px-1 pb-2 text-sm font-medium">
          All ({filtered.length})
        </button>
        <button className="text-text-tertiary hover:text-text-secondary px-1 pb-2 text-sm font-medium">
          Documents ({documents.length})
        </button>
        <button className="text-text-tertiary hover:text-text-secondary px-1 pb-2 text-sm font-medium">
          Websites ({websites.length})
        </button>
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
            Add your first document
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
            const crawlMeta = doc.metadata?.crawlProgress as
              | { visited: number; total: number }
              | undefined
            const crawlSchedule = doc.metadata?.crawlSchedule as
              | { enabled: boolean; frequency: string; nextRun?: string }
              | undefined

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
                      {doc.status === "processing" && crawlMeta
                        ? `${crawlMeta.visited}/${crawlMeta.total} crawled`
                        : config.label}
                    </Badge>
                    <span className="text-text-muted hidden text-xs sm:inline">
                      {doc.sourceType === "website" ? "Website" : "Document"}
                    </span>
                  </div>
                  <p className="text-text-muted mt-0.5 flex items-center gap-1 text-xs">
                    {timeAgo(doc.createdAt)}
                    {doc.sourceType === "website" && doc.sourceUrl && (
                      <>
                        <span>&middot;</span>
                        <span className="truncate">{doc.sourceUrl}</span>
                      </>
                    )}
                    {doc.sourceType !== "website" && doc.sourceUrl && doc.status === "failed" && (
                      <span className="text-danger-text truncate">
                        &middot; {doc.errorMessage ?? "Error"}
                      </span>
                    )}
                  </p>
                  {crawlSchedule?.enabled && (
                    <p className="text-text-muted mt-0.5 flex items-center gap-1 text-xs">
                      <RefreshCw className="h-3 w-3" />
                      Re-crawls {crawlSchedule.frequency}
                      {crawlSchedule.nextRun && (
                        <> &middot; Next: {new Date(crawlSchedule.nextRun).toLocaleDateString()}</>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                  {doc.sourceType === "website" && (
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => router.push(`/dashboard/knowledge-base/crawls?id=${doc.id}`)}
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Re-crawl
                    </Button>
                  )}
                  <Button variant="danger" size="xs" onClick={() => setDeleteTarget(doc)}>
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.title ?? "Untitled"}"?`}
        description={`This will permanently remove this ${deleteTarget?.sourceType === "website" ? "crawl" : "document"} and all its content chunks from the knowledge base.`}
        confirmText={deleteTarget?.title ?? "Untitled"}
        onConfirm={() => deleteTarget && deleteDoc.mutate({ id: deleteTarget.id })}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteDoc.isPending}
      />
    </div>
  )
}
