"use client"

function BarChart({
  data,
  height = 160,
}: {
  data: { date: string; conversations: number }[]
  height?: number
}) {
  const max = Math.max(...data.map((d) => d.conversations), 1)
  const chartWidth = 640
  const barCount = data.length
  const barWidth = Math.max(4, Math.min(16, (chartWidth - barCount * 2) / barCount))
  const padTop = 8
  const padBottom = 24

  return (
    <svg
      viewBox={`0 0 ${chartWidth} ${height}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {data.map((d, i) => {
        const barH = (d.conversations / max) * (height - padTop - padBottom)
        const x = i * (barWidth + 2)
        const y = height - padBottom - barH
        return (
          <g key={d.date}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barH, 1)}
              rx={2}
              className="fill-[#6366f1] opacity-80 hover:opacity-100"
            />
            {i % 5 === 0 && (
              <text
                x={x + barWidth / 2}
                y={height - 4}
                textAnchor="end"
                transform={`rotate(-45, ${x + barWidth / 2}, ${height - 4})`}
                className="fill-[#94a3b8] text-[8px]"
              >
                {d.date.slice(5)}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function DonutPreview({
  items,
}: {
  items: { label: string; value: number; color: string }[]
}) {
  const total = items.reduce((s, d) => s + d.value, 0) || 1

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((d) => (
        <div key={d.label} className="flex items-center gap-1.5 text-sm">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: d.color }}
          />
          <span className="w-16 capitalize text-[#64748b]">{d.label}</span>
          <span className="font-medium text-[#0f172a]">{d.value}</span>
          <span className="text-xs text-[#94a3b8]">
            ({Math.round((d.value / total) * 100)}%)
          </span>
        </div>
      ))}
    </div>
  )
}

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

export function AnalyticsClient({
  overview,
  volume,
  statusDistribution,
  agentRanking,
  channelDistribution,
}: {
  overview: Overview
  volume: VolumeEntry[]
  statusDistribution: StatusEntry[]
  agentRanking: AgentEntry[]
  channelDistribution: ChannelEntry[]
}) {
  const statusColors: Record<string, string> = {
    active: "#22c55e",
    waiting: "#f59e0b",
    resolved: "#6366f1",
    closed: "#94a3b8",
  }

  const channelColors: Record<string, string> = {
    widget: "#6366f1",
    slack: "#4f46e5",
    discord: "#7c3aed",
  }

  const statCards = [
    {
      label: "Total Conversations",
      value: overview.totalConversations,
      sub: `${overview.conversationsToday} today`,
      color: "bg-[#eef2ff] text-[#6366f1]",
    },
    {
      label: "Total Messages",
      value: overview.totalMessages,
      sub: `${overview.messagesToday} today`,
      color: "bg-[#f0fdf4] text-[#16a34a]",
    },
    {
      label: "Active Now",
      value: overview.activeConversations,
      sub: `${overview.resolvedConversations} resolved`,
      color: "bg-[#fffbeb] text-[#d97706]",
    },
    {
      label: "Avg Messages / Conv",
      value: overview.avgMessagesPerConversation,
      sub: "per conversation",
      color: "bg-[#f1f5f9] text-[#64748b]",
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[#0f172a]">Analytics</h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Metrics and insights for your customer support operations.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-[#e2e8f0] bg-white p-5">
            <div
              className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}
            >
              <span className="text-lg font-bold">{card.value}</span>
            </div>
            <p className="text-sm font-medium text-[#0f172a]">{card.label}</p>
            <p className="mt-0.5 text-xs text-[#94a3b8]">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-xl border border-[#e2e8f0] bg-white p-6">
        <h2 className="mb-1 text-sm font-semibold text-[#0f172a]">Conversation Volume</h2>
        <p className="mb-4 text-xs text-[#94a3b8]">Daily conversations over the last 30 days</p>
        {volume.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#94a3b8]">No data yet.</p>
        ) : (
          <BarChart data={volume} />
        )}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-6">
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-6">
          <h2 className="mb-1 text-sm font-semibold text-[#0f172a]">Conversation Status</h2>
          <p className="mb-4 text-xs text-[#94a3b8]">Breakdown by current status</p>
          {statusDistribution.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#94a3b8]">No data yet.</p>
          ) : (
            <DonutPreview
              items={statusDistribution.map((s) => ({
                label: s.status,
                value: s.count,
                color: statusColors[s.status] ?? "#94a3b8",
              }))}
            />
          )}
        </div>

        <div className="rounded-xl border border-[#e2e8f0] bg-white p-6">
          <h2 className="mb-1 text-sm font-semibold text-[#0f172a]">Channel Distribution</h2>
          <p className="mb-4 text-xs text-[#94a3b8]">Conversations by channel type</p>
          {channelDistribution.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#94a3b8]">No data yet.</p>
          ) : (
            <DonutPreview
              items={channelDistribution.map((c) => ({
                label: c.channelType,
                value: c.conversationCount,
                color: channelColors[c.channelType] ?? "#94a3b8",
              }))}
            />
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6">
        <h2 className="mb-1 text-sm font-semibold text-[#0f172a]">Agent Performance</h2>
        <p className="mb-4 text-xs text-[#94a3b8]">Conversations and messages handled per agent</p>
        {agentRanking.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#94a3b8]">No agents configured yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e2e8f0] text-left text-xs font-medium text-[#94a3b8]">
                  <th className="pb-3 pr-4">Agent</th>
                  <th className="pb-3 pr-4">Conversations</th>
                  <th className="pb-3 pr-4">Messages</th>
                  <th className="pb-3">Avg / Conv</th>
                </tr>
              </thead>
              <tbody>
                {agentRanking.map((agent) => (
                  <tr key={agent.agentId} className="border-b border-[#e2e8f0] last:border-0">
                    <td className="py-3 pr-4 font-medium text-[#0f172a]">{agent.agentName}</td>
                    <td className="py-3 pr-4 text-[#64748b]">{agent.conversationCount}</td>
                    <td className="py-3 pr-4 text-[#64748b]">{agent.messageCount}</td>
                    <td className="py-3 text-[#64748b]">
                      {agent.conversationCount > 0
                        ? Math.round(agent.messageCount / agent.conversationCount)
                        : 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
