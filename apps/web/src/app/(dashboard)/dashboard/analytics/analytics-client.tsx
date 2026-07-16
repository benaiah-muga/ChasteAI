"use client"

import { useState } from "react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { BarChart3, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type Overview = {
  totalConversations: number
  totalMessages: number
  activeConversations: number
  resolvedConversations: number
  avgMessagesPerConversation: number
  conversationsToday: number
  messagesToday: number
}

type VolumeEntry = {
  date: string
  conversations: number
}

type StatusEntry = {
  status: string
  count: number
}

type AgentEntry = {
  agentId: string
  agentName: string
  conversationCount: number
  messageCount: number
}

type ChannelEntry = {
  channelType: string
  conversationCount: number
}

const timeRanges = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
] as const

const statusConfig: Record<
  string,
  { label: string; variant: "success" | "warning" | "accent" | "neutral" }
> = {
  active: { label: "Active", variant: "success" },
  waiting: { label: "Waiting", variant: "warning" },
  resolved: { label: "Resolved", variant: "accent" },
  closed: { label: "Closed", variant: "neutral" },
}

const channelColors: Record<string, string> = {
  widget: "var(--color-accent)",
  web: "var(--color-info)",
  api: "var(--color-warning)",
  telegram: "var(--color-primary)",
}

const channelIcons: Record<string, string> = {
  widget: "Widget",
  web: "Web",
  api: "API",
  telegram: "Telegram",
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-elevated border-border rounded-lg border px-3 py-2 shadow-lg">
      <p className="text-text-muted text-xs">{label}</p>
      <p className="text-accent text-sm font-semibold tabular-nums">
        {payload[0]?.value ?? 0} conversations
      </p>
    </div>
  )
}

export function AnalyticsClient({
  overview: initialOverview,
  volume: initialVolume,
  statusDistribution: initialStatus,
  agentRanking: initialAgents,
  channelDistribution: initialChannels,
}: {
  overview: Overview
  volume: VolumeEntry[]
  statusDistribution: StatusEntry[]
  agentRanking: AgentEntry[]
  channelDistribution: ChannelEntry[]
}) {
  const [timeRange, setTimeRange] = useState(30)

  const statCards = [
    {
      label: "Total Conversations",
      value: initialOverview.totalConversations,
      sub: `${initialOverview.conversationsToday} today`,
    },
    {
      label: "Total Messages",
      value: initialOverview.totalMessages,
      sub: `${initialOverview.messagesToday} today`,
    },
    {
      label: "Active Now",
      value: initialOverview.activeConversations,
      sub: `${initialOverview.resolvedConversations} resolved`,
    },
    {
      label: "Avg / Conversation",
      value: initialOverview.avgMessagesPerConversation,
      sub: "messages per conv",
    },
  ]

  const hasData = initialVolume.length > 0

  const sortedChannels = [...initialChannels].sort(
    (a, b) => b.conversationCount - a.conversationCount,
  )
  const maxChannelCount = Math.max(...sortedChannels.map((c) => c.conversationCount), 1)

  const sortedAgents = [...initialAgents].sort((a, b) => b.conversationCount - a.conversationCount)
  const totalConversations = sortedAgents.reduce((s, a) => s + a.conversationCount, 0)

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-text-primary font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            Analytics
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            Metrics and insights for your customer support operations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-surface border-border inline-flex rounded-lg border p-0.5">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  timeRange === range.value
                    ? "bg-surface-elevated text-text-primary"
                    : "text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <button className="border-border text-text-tertiary hover:text-text-secondary hover:bg-surface-elevated inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors">
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-surface border-border rounded-lg border p-5">
            <p className="text-text-primary font-[family-name:var(--font-display)] text-3xl font-semibold tabular-nums">
              {card.value}
            </p>
            <p className="text-text-muted mt-2 text-xs font-medium uppercase tracking-wide">
              {card.label}
            </p>
            <p className="text-text-tertiary mt-1 text-xs">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface border-border rounded-lg border">
        <div className="px-5 pb-4 pt-5">
          <p className="text-text-primary text-sm font-medium">Conversation Volume</p>
          <p className="text-text-muted mt-0.5 text-xs">Daily conversations over time</p>
        </div>
        <div className="px-5 pb-5">
          {!hasData ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="text-text-muted mb-3 h-10 w-10" />
              <p className="text-text-primary text-sm font-medium">No data yet</p>
              <p className="text-text-tertiary mt-1 text-xs">
                Analytics will populate once your agents handle conversations.
              </p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={initialVolume} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                    tickFormatter={(val: string) => {
                      const d = new Date(val)
                      return `${d.getMonth() + 1}/${d.getDate()}`
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="conversations"
                    stroke="var(--color-accent)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: "var(--color-accent)",
                      stroke: "var(--color-surface)",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-surface border-border rounded-lg border">
          <div className="px-5 pb-4 pt-5">
            <p className="text-text-primary text-sm font-medium">Channel Distribution</p>
            <p className="text-text-muted mt-0.5 text-xs">Conversations by channel</p>
          </div>
          <div className="px-5 pb-5">
            {sortedChannels.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-text-tertiary text-xs">No channel data yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedChannels.map((ch) => {
                  const pct = Math.round((ch.conversationCount / maxChannelCount) * 100)
                  return (
                    <div key={ch.channelType}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-text-primary font-medium">
                          {channelIcons[ch.channelType] ?? ch.channelType}
                        </span>
                        <span className="text-text-tertiary tabular-nums">
                          {ch.conversationCount}{" "}
                          <span className="text-text-muted">
                            (
                            {Math.round(
                              (ch.conversationCount /
                                (sortedChannels.reduce((s, c) => s + c.conversationCount, 0) ||
                                  1)) *
                                100,
                            )}
                            %)
                          </span>
                        </span>
                      </div>
                      <div className="bg-surface-elevated h-1.5 overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.max(pct, 2)}%`,
                            backgroundColor:
                              channelColors[ch.channelType] ?? "var(--color-text-muted)",
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface border-border rounded-lg border">
          <div className="px-5 pb-4 pt-5">
            <p className="text-text-primary text-sm font-medium">Conversation Status</p>
            <p className="text-text-muted mt-0.5 text-xs">Breakdown by current status</p>
          </div>
          <div className="px-5 pb-5">
            {initialStatus.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-text-tertiary text-xs">No status data yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {initialStatus.map((s) => {
                  const config = statusConfig[s.status] ?? {
                    label: s.status,
                    variant: "neutral" as const,
                  }
                  const total = initialStatus.reduce((sum, st) => sum + st.count, 0)
                  const pct = Math.round((s.count / total) * 100)
                  return (
                    <div key={s.status} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2.5">
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-text-primary text-sm font-medium tabular-nums">
                          {s.count}
                        </span>
                        <span className="text-text-muted w-10 text-right text-xs tabular-nums">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface border-border rounded-lg border">
        <div className="px-5 pb-4 pt-5">
          <p className="text-text-primary text-sm font-medium">Agent Performance</p>
          <p className="text-text-muted mt-0.5 text-xs">
            Conversations and messages handled per agent
          </p>
        </div>
        <div className="px-5 pb-5">
          {sortedAgents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-text-tertiary text-xs">No agents configured yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-border text-text-muted border-b text-left text-xs font-medium uppercase tracking-wide">
                    <th className="pb-3 pr-4">Agent</th>
                    <th className="pb-3 pr-4">Conversations</th>
                    <th className="pb-3 pr-4">Messages</th>
                    <th className="pb-3">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAgents.map((agent) => (
                    <tr
                      key={agent.agentId}
                      className="border-border hover:bg-surface-elevated border-b transition-colors last:border-0"
                    >
                      <td className="text-text-primary py-3 pr-4 font-medium">{agent.agentName}</td>
                      <td className="text-text-secondary py-3 pr-4 tabular-nums">
                        {agent.conversationCount}
                      </td>
                      <td className="text-text-secondary py-3 pr-4 tabular-nums">
                        {agent.messageCount}
                      </td>
                      <td className="text-text-tertiary py-3 tabular-nums">
                        {totalConversations > 0
                          ? `${Math.round((agent.conversationCount / totalConversations) * 100)}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
