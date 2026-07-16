"use client"

import Link from "next/link"
import type { inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "@/server/api/root"
import { api } from "@/trpc/react"
import { Bot, Key, FileText } from "lucide-react"

type RouterOutput = inferRouterOutputs<AppRouter>
type Stats = RouterOutput["dashboard"]["stats"]
type RecentConversation = RouterOutput["dashboard"]["recentConversations"][number]

export function DashboardClient({
  stats: initialStats,
  recentConversations: initialRecent,
}: {
  stats: Stats
  recentConversations: RecentConversation[]
}) {
  const { data: stats } = api.dashboard.stats.useQuery(undefined, {
    initialData: initialStats,
  })
  const { data: recent } = api.dashboard.recentConversations.useQuery(undefined, {
    initialData: initialRecent,
  })

  const statCards = [
    {
      label: "Agents",
      value: stats.agentCount,
      href: "/dashboard/agents",
    },
    {
      label: "Conversations",
      value: stats.conversationCount,
      href: "/dashboard/agents",
    },
    {
      label: "Channels",
      value: stats.channelCount,
      href: "/dashboard/agents",
    },
    {
      label: "Messages",
      value: stats.messageCount,
      href: "/dashboard/agents",
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-text-primary font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Overview
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Monitor your customer support infrastructure at a glance.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-surface hover:bg-surface-elevated border-border rounded-lg border p-5 transition-colors"
          >
            <p className="text-text-primary font-[family-name:var(--font-display)] text-3xl font-semibold tabular-nums">
              {card.value}
            </p>
            <p className="text-text-muted mt-1 text-xs font-medium uppercase tracking-wide">
              {card.label}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border-border bg-surface rounded-lg border">
          <div className="border-border border-b px-5 py-4">
            <h2 className="text-text-primary font-[family-name:var(--font-display)] text-sm font-semibold">
              Quick Actions
            </h2>
          </div>
          <div className="p-2">
            <Link
              href="/dashboard/agents/new"
              className="text-text-secondary hover:bg-surface-elevated hover:text-text-primary group flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] transition-colors"
            >
              <div className="bg-surface-elevated group-hover:bg-accent/10 group-hover:text-accent flex h-8 w-8 items-center justify-center rounded-md transition-colors">
                <Bot className="h-4 w-4" />
              </div>
              <span className="font-medium">Create new agent</span>
            </Link>
            <Link
              href="/dashboard/api-keys"
              className="text-text-secondary hover:bg-surface-elevated hover:text-text-primary group flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] transition-colors"
            >
              <div className="bg-surface-elevated group-hover:bg-accent/10 group-hover:text-accent flex h-8 w-8 items-center justify-center rounded-md transition-colors">
                <Key className="h-4 w-4" />
              </div>
              <span className="font-medium">Generate API key</span>
            </Link>
            <Link
              href="/dashboard/knowledge-base"
              className="text-text-secondary hover:bg-surface-elevated hover:text-text-primary group flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] transition-colors"
            >
              <div className="bg-surface-elevated group-hover:bg-accent/10 group-hover:text-accent flex h-8 w-8 items-center justify-center rounded-md transition-colors">
                <FileText className="h-4 w-4" />
              </div>
              <span className="font-medium">Upload document</span>
            </Link>
          </div>
        </div>

        <div className="border-border bg-surface rounded-lg border">
          <div className="border-border border-b px-5 py-4">
            <h2 className="text-text-primary font-[family-name:var(--font-display)] text-sm font-semibold">
              Recent Conversations
            </h2>
          </div>
          <div className="p-2">
            {recent.length === 0 ? (
              <p className="text-text-muted py-4 text-center text-[13px]">No conversations yet.</p>
            ) : (
              <div className="space-y-0.5">
                {recent.slice(0, 5).map((conv) => (
                  <div
                    key={conv.id}
                    className="hover:bg-surface-elevated flex items-center justify-between rounded-md px-3 py-2 text-[13px] transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span
                        className={`inline-block h-2 w-2 shrink-0 rounded-full ${conv.status === "active" ? "bg-success" : "bg-text-muted"}`}
                      />
                      <span className="text-text-secondary truncate font-medium">
                        {conv.agentName}
                      </span>
                    </div>
                    <span className="text-text-muted shrink-0 whitespace-nowrap text-xs">
                      {conv.messageCount} msgs
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
