"use client"

import { useState } from "react"
import { MessageCircle, Search, Send, ArrowLeft, User } from "lucide-react"
import { api } from "@/trpc/react"
import { Input } from "@/components/ui/input"

type Conversation = {
  id: string
  channelId: string
  externalUserId: string | null
  status: string
  messageCount: number
  createdAt: Date
  updatedAt: Date
}

const statusConfig: Record<
  string,
  { variant: "success" | "warning" | "accent" | "neutral"; label: string; dot: string }
> = {
  active: { variant: "success", label: "Active", dot: "bg-success" },
  waiting: { variant: "warning", label: "Waiting", dot: "bg-warning" },
  resolved: { variant: "accent", label: "Resolved", dot: "bg-accent" },
  closed: { variant: "neutral", label: "Closed", dot: "bg-text-muted" },
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

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

type SortKey =
  | "newest"
  | "oldest"
  | "most-messages"
  | "fewest-messages"
  | "active-first"
  | "resolved-first"

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "most-messages", label: "Most messages" },
  { value: "fewest-messages", label: "Fewest messages" },
  { value: "active-first", label: "Active first" },
  { value: "resolved-first", label: "Resolved first" },
]

const STATUS_ORDER: Record<string, number> = {
  active: 0,
  waiting: 1,
  resolved: 2,
  closed: 3,
}

export function ConversationsClient({ conversations: initial }: { conversations: Conversation[] }) {
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [composerText, setComposerText] = useState("")
  const [sort, setSort] = useState<SortKey>("newest")

  const { data: conversationDetail } = api.conversation.getById.useQuery(
    { id: selectedId! },
    { enabled: !!selectedId },
  )

  const filtered = initial
    .filter((c) => {
      if (!search) return true
      const query = search.toLowerCase()
      return (
        c.externalUserId?.toLowerCase().includes(query) || c.status.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      switch (sort) {
        case "newest":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case "oldest":
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        case "most-messages":
          return b.messageCount - a.messageCount
        case "fewest-messages":
          return a.messageCount - b.messageCount
        case "active-first":
          return (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99)
        case "resolved-first":
          return (STATUS_ORDER[b.status] ?? 99) - (STATUS_ORDER[a.status] ?? 99)
        default:
          return 0
      }
    })

  function handleSelect(id: string) {
    setSelectedId(id)
  }

  function handleBack() {
    setSelectedId(null)
  }

  const selectedConv = initial.find((c) => c.id === selectedId)

  return (
    <div className="mx-auto flex max-w-6xl gap-0 lg:flex-row">
      <div
        className={`border-border bg-bg w-full border-r lg:w-[360px] lg:shrink-0 ${
          selectedId ? "hidden lg:block" : "block"
        }`}
      >
        <div className="border-border flex flex-col gap-3 border-b p-4">
          <div>
            <h1 className="text-text-primary font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
              Conversations
            </h1>
            <p className="text-text-muted mt-0.5 text-sm">{initial.length} total</p>
          </div>
          <div className="relative">
            <Search className="text-text-muted absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-border bg-bg pl-9"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="border-border bg-bg text-text-secondary focus:border-accent focus:ring-accent block w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none focus:ring-1"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <MessageCircle className="text-text-muted mb-3 h-8 w-8" />
              <p className="text-text-primary text-sm font-medium">No conversations yet</p>
              <p className="text-text-muted mt-1 text-xs">
                Conversations will appear here once your agent starts receiving messages.
              </p>
            </div>
          ) : (
            <div className="p-1">
              {filtered.map((conv) => {
                const config = statusConfig[conv.status] ?? {
                  variant: "neutral" as const,
                  label: conv.status,
                  dot: "bg-text-muted",
                }
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelect(conv.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      selectedId === conv.id ? "bg-surface-active" : "hover:bg-surface-hover"
                    }`}
                  >
                    <div className="bg-accent-subtle text-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-text-primary truncate text-sm font-medium">
                          {conv.externalUserId
                            ? `User ${conv.externalUserId.slice(0, 8)}`
                            : "Anonymous"}
                        </span>
                        <span className="text-text-muted shrink-0 text-xs">
                          {timeAgo(conv.updatedAt)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${config.dot}`} />
                        <span className="text-text-secondary text-xs">{config.label}</span>
                        <span className="text-text-muted text-xs">
                          &middot; {conv.messageCount} msgs
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className={`flex flex-1 flex-col ${!selectedId ? "hidden lg:flex" : "flex"}`}>
        {selectedConv && conversationDetail ? (
          <>
            <div className="border-border flex items-center gap-3 border-b px-4 py-3">
              <button
                onClick={handleBack}
                className="text-text-muted hover:text-text-primary transition-colors lg:hidden"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="bg-accent-subtle text-accent flex h-8 w-8 items-center justify-center rounded-full">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-text-primary truncate text-sm font-medium">
                  {selectedConv.externalUserId
                    ? `User ${selectedConv.externalUserId.slice(0, 8)}`
                    : "Anonymous"}
                </p>
                <p className="text-text-muted flex items-center gap-1.5 text-xs">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      statusConfig[selectedConv.status]?.dot ?? "bg-text-muted"
                    }`}
                  />
                  {selectedConv.status}
                </p>
              </div>
            </div>

            <div
              className="bg-bg flex-1 overflow-y-auto px-4 py-4"
              style={{ maxHeight: "calc(100vh - 380px)" }}
            >
              <div className="space-y-3">
                {conversationDetail.messages.map((msg) => {
                  const isUser = msg.role === "user"
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2.5 ${
                          isUser
                            ? "bg-accent text-text-inverse rounded-2xl rounded-br-md"
                            : "bg-surface-elevated text-text-primary rounded-2xl rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p
                          className={`mt-1 text-right text-xs ${
                            isUser ? "text-white/60" : "text-text-muted"
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="border-border bg-bg flex items-end gap-2 border-t p-4">
              <textarea
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                  }
                }}
                placeholder="Type a message..."
                rows={1}
                className="border-border bg-bg text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-accent min-h-[36px] flex-1 resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
              />
              <button
                disabled={!composerText.trim()}
                className="bg-accent hover:bg-accent-strong text-accent-text flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <MessageCircle className="text-text-muted mb-4 h-12 w-12" />
            <p className="text-text-primary text-sm font-medium">Select a conversation</p>
            <p className="text-text-muted mt-1 text-xs">
              Choose a conversation from the list to view messages.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
