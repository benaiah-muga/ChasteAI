"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Globe,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  CalendarClock,
  Loader2,
} from "lucide-react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
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

const statusIcon: Record<string, typeof CheckCircle2> = {
  ready: CheckCircle2,
  failed: XCircle,
  processing: Loader2,
  pending: Clock,
}

const statusBadge: Record<
  string,
  { variant: "success" | "danger" | "warning" | "neutral"; label: string }
> = {
  ready: { variant: "success", label: "Completed" },
  failed: { variant: "danger", label: "Failed" },
  processing: { variant: "warning", label: "Crawling" },
  pending: { variant: "neutral", label: "Pending" },
}

export function CrawlsClient({ documents: initial }: { documents: Document[] }) {
  const router = useRouter()
  const utils = api.useUtils()
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null)

  const deleteDoc = api.document.delete.useMutation({
    onSuccess: () => {
      utils.document.list.invalidate()
      router.refresh()
      setDeleteTarget(null)
    },
  })

  const websites = initial.filter((d) => d.sourceType === "website")

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.push("/dashboard/knowledge-base")}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-text-primary font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            Crawl History
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            View and manage website crawls. Schedule re-crawls to keep knowledge up to date.
          </p>
        </div>
      </div>

      {websites.length === 0 ? (
        <div className="bg-surface border-border rounded-lg border py-16 text-center">
          <div className="bg-accent-subtle text-accent mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Globe className="h-6 w-6" />
          </div>
          <h3 className="text-text-primary text-sm font-medium">No website crawls yet</h3>
          <p className="text-text-muted mt-1 text-sm">
            Crawl a website from the Knowledge Base page to see its history here.
          </p>
          <Button className="mt-6" onClick={() => router.push("/dashboard/knowledge-base")}>
            Go to Knowledge Base
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {websites.map((doc) => {
            const statusInfo = statusBadge[doc.status] ?? {
              variant: "neutral" as const,
              label: doc.status,
            }
            const StatusIcon = statusIcon[doc.status] ?? Clock
            const crawlMeta = doc.metadata?.crawlProgress as
              | { visited: number; total: number; currentUrl?: string }
              | undefined
            const crawlSchedule = doc.metadata?.crawlSchedule as
              | { enabled: boolean; frequency: string; nextRun?: string; lastRun?: string }
              | undefined

            return (
              <div key={doc.id} className="bg-surface border-border rounded-lg border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <div
                      className={`mt-1 shrink-0 ${doc.status === "failed" ? "text-danger" : doc.status === "ready" ? "text-success" : "text-accent"}`}
                    >
                      <StatusIcon
                        className={`h-5 w-5 ${doc.status === "processing" ? "animate-spin" : ""}`}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-text-primary truncate text-sm font-medium">
                          {doc.title || doc.sourceUrl || "Untitled"}
                        </span>
                        <Badge variant={statusInfo.variant} className="text-[10px]">
                          {statusInfo.label}
                        </Badge>
                      </div>
                      {doc.sourceUrl && (
                        <p className="text-text-muted mt-1 truncate text-xs">{doc.sourceUrl}</p>
                      )}
                      <div className="text-text-muted mt-2 flex flex-wrap items-center gap-3 text-xs tabular-nums">
                        <span>Crawled {timeAgo(doc.createdAt)}</span>
                        {crawlMeta && doc.status === "processing" && (
                          <>
                            <span>
                              {crawlMeta.visited} / {crawlMeta.total || "?"} pages
                            </span>
                            {crawlMeta.currentUrl && (
                              <span className="max-w-[200px] truncate">{crawlMeta.currentUrl}</span>
                            )}
                          </>
                        )}
                        {crawlMeta && doc.status === "ready" && (
                          <span>{crawlMeta.total} pages indexed</span>
                        )}
                      </div>
                      {crawlSchedule?.enabled && (
                        <div className="bg-surface-elevated mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs">
                          <CalendarClock className="text-text-muted h-3.5 w-3.5" />
                          <span className="text-text-secondary">
                            Re-crawls {crawlSchedule.frequency}
                          </span>
                          {crawlSchedule.lastRun && (
                            <span className="text-text-muted">
                              &middot; Last: {timeAgo(new Date(crawlSchedule.lastRun))}
                            </span>
                          )}
                          {crawlSchedule.nextRun && (
                            <span className="text-text-muted">
                              &middot; Next: {new Date(crawlSchedule.nextRun).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => {
                        /* TODO: trigger re-crawl */
                      }}
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Re-crawl
                    </Button>
                    <Button variant="danger" size="xs" onClick={() => setDeleteTarget(doc)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete crawl "${deleteTarget?.title ?? "Untitled"}"?`}
        description="This will permanently remove the crawled content from the knowledge base."
        confirmText={deleteTarget?.title ?? "Untitled"}
        onConfirm={() => deleteTarget && deleteDoc.mutate({ id: deleteTarget.id })}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteDoc.isPending}
      />
    </div>
  )
}
