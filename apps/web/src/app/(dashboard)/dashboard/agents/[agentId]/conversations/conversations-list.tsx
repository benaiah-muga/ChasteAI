"use client"

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
  messageCount: number
  createdAt: Date
  updatedAt: Date
}

function ConversationStatus({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: "bg-[#22c55e]",
    waiting: "bg-[#f59e0b]",
    resolved: "bg-[#6366f1]",
    closed: "bg-[#94a3b8]",
  }

  return (
    <span className={`inline-block h-1.5 w-1.5 rounded-full ${colorMap[status] ?? "bg-[#94a3b8]"}`} />
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
  return (
    <div className="mx-auto max-w-4xl px-8 py-8">
      <div className="mb-8">
        <Link
          href={`/dashboard/agents/${agent.id}`}
          className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-[#64748b] hover:text-[#0f172a]"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to {agent.name}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0f172a]">
          Conversations
        </h1>
        <p className="mt-1 text-sm text-[#64748b]">
          All conversations handled by {agent.name}.
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#e2e8f0] bg-white px-6 py-16">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2ff]">
            <svg className="h-6 w-6 text-[#6366f1]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-[#0f172a]">No conversations yet</h3>
          <p className="mt-1 text-sm text-[#64748b]">
            Conversations will appear here once users start chatting with this agent.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/dashboard/agents/${agent.id}/conversations/${conversation.id}`}
              className="flex items-center justify-between rounded-lg border border-[#e2e8f0] bg-white px-5 py-4 transition-colors hover:bg-[#f8fafc]"
            >
              <div className="flex items-center gap-3">
                <ConversationStatus status={conversation.status} />
                <div>
                  <p className="text-sm font-medium text-[#0f172a]">
                    {conversation.externalUserId
                      ? `User ${conversation.externalUserId.slice(0, 8)}`
                      : "Anonymous"}
                  </p>
                  <p className="text-xs text-[#64748b]">
                    {conversation.messageCount} messages · {conversation.status}
                  </p>
                </div>
              </div>
              <div className="text-xs text-[#94a3b8]">
                {timeAgo(conversation.updatedAt)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
