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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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
  slack: "var(--color-success)",
  discord: "var(--color-accent-strong)",
  telegram: "var(--color-primary)",
  whatsapp: "var(--color-success-strong)",
}

const channelIcons: Record<string, string> = {
  widget: "Widget",
  web: "Web",
  api: "API",
  slack: "Slack",
  discord: "Discord",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
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
    <div className="border-border bg-surface-elevated rounded-lg border px-3 py-2 shadow-lg">
      <p className="text-text-primary text-xs font-medium">{label}</p>
      <p className="text-accent text-xs font-semibold">{payload[0]?.value ?? 0} conversations</p>
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
      accent: "accent",
    },
    {
      label: "Total Messages",
      value: initialOverview.totalMessages,
      sub: `${initialOverview.messagesToday} today`,
      accent: "success",
    },
    {
      label: "Active Now",
      value: initialOverview.activeConversations,
      sub: `${initialOverview.resolvedConversations} resolved`,
      accent: "warning",
    },
    {
      label: "Avg / Conversation",
      value: initialOverview.avgMessagesPerConversation,
      sub: "messages per conv",
      accent: "neutral",
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
          <h1 className="text-text-primary text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-text-tertiary mt-1 text-sm">
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
                    ? "bg-surface-active text-text-primary"
                    : "text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <button className="border-border text-text-tertiary hover:text-text-secondary hover:bg-surface-hover inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors">
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => {
          const accentMap: Record<string, string> = {
            accent: "bg-accent-subtle text-accent-text ring-1 ring-accent-border",
            success: "bg-success-subtle text-success-text ring-1 ring-success-border",
            warning: "bg-warning-subtle text-warning-text ring-1 ring-warning-border",
            neutral: "bg-surface-high text-text-tertiary ring-1 ring-border",
          }
          return (
            <div
              key={card.label}
              className="border-border bg-surface group rounded-xl border p-5 transition-shadow hover:shadow-sm"
            >
              <div
                className={`mb-3 inline-flex h-1 w-10 items-center justify-center rounded-full ${accentMap[card.accent]}`}
              />
              <p className="text-text-primary mb-1 text-2xl font-bold">{card.value}</p>
              <p className="text-text-secondary text-xs font-medium">{card.label}</p>
              <p className="text-text-muted mt-0.5 text-xs">{card.sub}</p>
            </div>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Conversation Volume</CardTitle>
          <p className="text-text-muted text-xs">Daily conversations over time</p>
        </CardHeader>
        <CardContent>
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
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    stroke="currentColor"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                    tickFormatter={(val: string) => {
                      const d = new Date(val)
                      return `${d.getMonth() + 1}/${d.getDate()}`
                    }}
                    className="text-text-muted"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                    className="text-text-muted"
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
                    activeDot={{ r: 4, fill: "var(--color-accent)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Channel Distribution</CardTitle>
            <p className="text-text-muted text-xs">Conversations by channel</p>
          </CardHeader>
          <CardContent>
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
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-text-primary font-medium capitalize">
                          {channelIcons[ch.channelType] ?? ch.channelType}
                        </span>
                        <span className="text-text-tertiary">
                          {ch.conversationCount} (
                          {Math.round(
                            (ch.conversationCount /
                              (sortedChannels.reduce((s, c) => s + c.conversationCount, 0) || 1)) *
                              100,
                          )}
                          %)
                        </span>
                      </div>
                      <div className="bg-surface-high h-2 overflow-hidden rounded-full">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Conversation Status</CardTitle>
            <p className="text-text-muted text-xs">Breakdown by current status</p>
          </CardHeader>
          <CardContent>
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
                    <div key={s.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-text-primary text-sm font-medium">{s.count}</span>
                        <span className="text-text-muted w-10 text-right text-xs">{pct}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Agent Performance</CardTitle>
          <p className="text-text-muted text-xs">Conversations and messages handled per agent</p>
        </CardHeader>
        <CardContent>
          {sortedAgents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-text-tertiary text-xs">No agents configured yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-border text-text-muted border-b text-left text-xs font-medium">
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
                      className="border-border hover:bg-surface-hover border-b transition-colors last:border-0"
                    >
                      <td className="text-text-primary py-3 pr-4 font-medium">{agent.agentName}</td>
                      <td className="text-text-secondary py-3 pr-4">{agent.conversationCount}</td>
                      <td className="text-text-secondary py-3 pr-4">{agent.messageCount}</td>
                      <td className="text-text-tertiary py-3">
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
        </CardContent>
      </Card>
    </div>
  )
}
