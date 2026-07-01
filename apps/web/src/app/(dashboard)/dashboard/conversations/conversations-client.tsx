"use client"

import { useState } from "react"
import { MessageCircle, Search, Send, ArrowLeft, User } from "lucide-react"
import { api } from "@/trpc/react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

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
  { variant: "success" | "warning" | "accent" | "neutral"; label: string }
> = {
  active: { variant: "success", label: "Active" },
  waiting: { variant: "warning", label: "Waiting" },
  resolved: { variant: "accent", label: "Resolved" },
  closed: { variant: "neutral", label: "Closed" },
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

export function ConversationsClient({ conversations: initial }: { conversations: Conversation[] }) {
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [composerText, setComposerText] = useState("")

  const { data: conversationDetail } = api.conversation.getById.useQuery(
    { id: selectedId! },
    { enabled: !!selectedId },
  )

  const filtered = initial.filter((c) => {
    if (!search) return true
    const query = search.toLowerCase()
    return c.externalUserId?.toLowerCase().includes(query) || c.status.toLowerCase().includes(query)
  })

  function handleSelect(id: string) {
    setSelectedId(id)
  }

  function handleBack() {
    setSelectedId(null)
  }

  const selectedConv = initial.find((c) => c.id === selectedId)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-0 lg:flex-row">
      <div
        className={`border-border bg-surface w-full border-b lg:w-[360px] lg:shrink-0 lg:border-b-0 lg:border-r ${
          selectedId ? "hidden lg:block" : "block"
        }`}
      >
        <div className="border-border flex flex-col gap-4 border-b p-4">
          <div>
            <h1 className="text-text-primary text-lg font-semibold tracking-tight">
              Conversations
            </h1>
            <p className="text-text-tertiary mt-0.5 text-xs">{initial.length} total</p>
          </div>
          <div className="relative">
            <Search className="text-text-muted absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <MessageCircle className="text-text-muted mb-3 h-8 w-8" />
              <p className="text-text-primary text-sm font-medium">No conversations yet</p>
              <p className="text-text-tertiary mt-1 text-xs">
                Conversations will appear here once your agent starts receiving messages.
              </p>
            </div>
          ) : (
            <div className="space-y-0.5 p-2">
              {filtered.map((conv) => {
                const config = statusConfig[conv.status] ?? {
                  variant: "neutral" as const,
                  label: conv.status,
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
                      <div className="mt-0.5 flex items-center gap-2">
                        <Badge variant={config.variant} className="text-[10px]">
                          {config.label}
                        </Badge>
                        <span className="text-text-muted text-xs">{conv.messageCount} msgs</span>
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
                <p className="text-text-muted flex items-center gap-1 text-xs">
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      selectedConv.status === "active" ? "bg-success" : "bg-text-muted"
                    }`}
                  />
                  {selectedConv.status}
                </p>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto px-4 py-4"
              style={{ maxHeight: "calc(100vh - 380px)" }}
            >
              <div className="space-y-4">
                {conversationDetail.messages.map((msg) => {
                  const isUser = msg.role === "user"
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isUser
                            ? "bg-accent-strong text-text-inverse rounded-tr-md"
                            : "bg-surface-elevated text-text-primary rounded-tl-md"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p
                          className={`mt-1 text-right text-[10px] ${
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

            <div className="border-border bg-surface flex items-end gap-2 border-t p-4">
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
            <p className="text-text-tertiary mt-1 text-xs">
              Choose a conversation from the list to view messages.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
