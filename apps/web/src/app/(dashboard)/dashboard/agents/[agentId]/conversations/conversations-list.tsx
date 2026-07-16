"use client"

import { useState } from "react"
import Link from "next/link"

type Agent = {
  id: string
  name: string
}

type Conversation = {
  id: string
  channelId: string
  externalUserId: string | null
  status: string
  isTest: boolean
  messageCount: number
  createdAt: Date
  updatedAt: Date
}

function ConversationStatus({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: "bg-success",
    waiting: "bg-warning",
    resolved: "bg-accent",
    closed: "bg-text-muted",
  }

  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full ${colorMap[status] ?? "bg-text-muted"}`}
    />
  )
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

export function ConversationsList({
  agent,
  conversations,
}: {
  agent: Agent
  conversations: Conversation[]
}) {
  const [showTest, setShowTest] = useState(true)

  const filtered = showTest ? conversations : conversations.filter((c) => !c.isTest)

  return (
    <div className="mx-auto max-w-4xl px-8 py-8">
      <div className="mb-8">
        <Link
          href={`/dashboard/agents/${agent.id}`}
          className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1 text-xs font-medium"
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          Back to {agent.name}
        </Link>
        <h1 className="text-text-primary font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Conversations
        </h1>
        <p className="text-text-secondary mt-1 text-sm">
          All conversations handled by {agent.name}.
        </p>
      </div>

      {conversations.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => setShowTest(true)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              showTest
                ? "bg-accent text-accent-text"
                : "bg-surface hover:bg-surface-elevated text-text-secondary"
            }`}
          >
            All ({conversations.length})
          </button>
          <button
            onClick={() => setShowTest(false)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              !showTest
                ? "bg-accent text-accent-text"
                : "bg-surface hover:bg-surface-elevated text-text-secondary"
            }`}
          >
            Real only ({conversations.filter((c) => !c.isTest).length})
          </button>
        </div>
      )}

      {conversations.length === 0 ? (
        <div className="bg-surface border-border flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-16">
          <div className="bg-accent-subtle mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <svg
              className="text-accent h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
              />
            </svg>
          </div>
          <h3 className="text-text-primary text-base font-semibold">No conversations yet</h3>
          <p className="text-text-secondary mt-1 text-sm">
            Conversations will appear here once users start chatting with this agent.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface border-border flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-16">
          <p className="text-text-secondary text-sm">No real conversations found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/dashboard/agents/${agent.id}/conversations/${conversation.id}`}
              className="bg-surface border-border hover:bg-surface-elevated/50 flex items-center justify-between rounded-lg border px-5 py-4 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ConversationStatus status={conversation.status} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-text-primary text-sm font-medium">
                      {conversation.externalUserId
                        ? `User ${conversation.externalUserId.slice(0, 8)}`
                        : "Anonymous"}
                    </p>
                    {conversation.isTest && (
                      <span className="border-warning bg-warning-subtle text-warning-text rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                        TEST
                      </span>
                    )}
                  </div>
                  <p className="text-text-secondary text-xs">
                    {conversation.messageCount} messages · {conversation.status}
                  </p>
                </div>
              </div>
              <div className="text-text-muted text-xs">{timeAgo(conversation.updatedAt)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
