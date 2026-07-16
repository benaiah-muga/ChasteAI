import { and, eq, gte, inArray, sql } from "drizzle-orm"
import {
  conversations,
  messages,
  channels,
  agents,
  analyticsEvents,
  type DatabaseClient,
} from "@chaste-ai/db"

export interface OverviewMetrics {
  totalConversations: number
  totalMessages: number
  activeConversations: number
  resolvedConversations: number
  avgMessagesPerConversation: number
  conversationsToday: number
  messagesToday: number
}

export interface DailyVolume {
  date: string
  conversations: number
  messages: number
}

export interface StatusDistribution {
  status: string
  count: number
}

export interface AgentRanking {
  agentId: string
  agentName: string
  conversationCount: number
  messageCount: number
}

export interface ChannelDistribution {
  channelType: string
  conversationCount: number
}

async function getChannelIdsForWorkspaces(db: DatabaseClient, workspaceIds: string[]) {
  if (workspaceIds.length === 0) return []
  const agentIds = await db
    .select({ id: agents.id })
    .from(agents)
    .where(inArray(agents.workspaceId, workspaceIds))
  if (agentIds.length === 0) return []
  const ch = await db
    .select({ id: channels.id })
    .from(channels)
    .where(
      inArray(
        channels.agentId,
        agentIds.map((a) => a.id),
      ),
    )
  return ch.map((c) => c.id)
}

export async function getOverview(
  db: DatabaseClient,
  workspaceIds: string[],
): Promise<OverviewMetrics> {
  const channelIds = await getChannelIdsForWorkspaces(db, workspaceIds)
  if (channelIds.length === 0) {
    return {
      totalConversations: 0,
      totalMessages: 0,
      activeConversations: 0,
      resolvedConversations: 0,
      avgMessagesPerConversation: 0,
      conversationsToday: 0,
      messagesToday: 0,
    }
  }

  const convResult = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where status = 'active')::int`,
      resolved: sql<number>`count(*) filter (where status = 'resolved')::int`,
      today: sql<number>`count(*) filter (where created_at >= current_date)::int`,
    })
    .from(conversations)
    .where(and(inArray(conversations.channelId, channelIds), eq(conversations.isTest, false)))

  const conv = convResult[0]!

  const convIds = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(and(inArray(conversations.channelId, channelIds), eq(conversations.isTest, false)))

  const msgResult =
    convIds.length > 0
      ? await db
          .select({
            total: sql<number>`count(*)::int`,
            today: sql<number>`count(*) filter (where created_at >= current_date)::int`,
          })
          .from(messages)
          .where(
            inArray(
              messages.conversationId,
              convIds.map((c) => c.id),
            ),
          )
      : [{ total: 0, today: 0 }]

  const msg = msgResult[0]!

  return {
    totalConversations: conv.total,
    totalMessages: msg.total,
    activeConversations: conv.active,
    resolvedConversations: conv.resolved,
    avgMessagesPerConversation: conv.total > 0 ? Math.round(msg.total / conv.total) : 0,
    conversationsToday: conv.today,
    messagesToday: msg.today,
  }
}

export async function getConversationVolume(
  db: DatabaseClient,
  workspaceIds: string[],
  days: number = 30,
): Promise<DailyVolume[]> {
  const channelIds = await getChannelIdsForWorkspaces(db, workspaceIds)
  if (channelIds.length === 0) return []

  const cutoff = sql`current_date - ${days}::int`

  const volume = await db
    .select({
      date: sql<string>`created_at::date`,
      conversations: sql<number>`count(*)::int`,
    })
    .from(conversations)
    .where(
      and(
        inArray(conversations.channelId, channelIds),
        gte(conversations.createdAt, cutoff),
        eq(conversations.isTest, false),
      ),
    )
    .groupBy(sql`created_at::date`)
    .orderBy(sql`created_at::date`)

  return volume.map((v) => ({
    date: v.date,
    conversations: v.conversations,
    messages: 0,
  }))
}

export async function getStatusDistribution(
  db: DatabaseClient,
  workspaceIds: string[],
): Promise<StatusDistribution[]> {
  const channelIds = await getChannelIdsForWorkspaces(db, workspaceIds)
  if (channelIds.length === 0) return []

  const result = await db
    .select({
      status: conversations.status,
      count: sql<number>`count(*)::int`,
    })
    .from(conversations)
    .where(and(inArray(conversations.channelId, channelIds), eq(conversations.isTest, false)))
    .groupBy(conversations.status)

  return result.map((r) => ({ status: r.status, count: r.count }))
}

export async function getAgentRanking(
  db: DatabaseClient,
  workspaceIds: string[],
): Promise<AgentRanking[]> {
  if (workspaceIds.length === 0) return []

  const workspaceAgents = await db
    .select({ id: agents.id, name: agents.name })
    .from(agents)
    .where(inArray(agents.workspaceId, workspaceIds))

  if (workspaceAgents.length === 0) return []

  const agentIds = workspaceAgents.map((a) => a.id)

  const agentChannels = await db
    .select({ id: channels.id, agentId: channels.agentId })
    .from(channels)
    .where(inArray(channels.agentId, agentIds))

  if (agentChannels.length === 0) {
    return workspaceAgents.map((a) => ({
      agentId: a.id,
      agentName: a.name,
      conversationCount: 0,
      messageCount: 0,
    }))
  }

  const channelIds = agentChannels.map((c) => c.id)
  const convData = await db
    .select({
      channelId: conversations.channelId,
      count: sql<number>`count(*)::int`,
    })
    .from(conversations)
    .where(and(inArray(conversations.channelId, channelIds), eq(conversations.isTest, false)))
    .groupBy(conversations.channelId)

  const convIds = await db
    .select({ id: conversations.id, channelId: conversations.channelId })
    .from(conversations)
    .where(and(inArray(conversations.channelId, channelIds), eq(conversations.isTest, false)))

  let msgCountPerChannel = new Map<string, number>()
  if (convIds.length > 0) {
    const msgData = await db
      .select({
        conversationId: messages.conversationId,
        count: sql<number>`count(*)::int`,
      })
      .from(messages)
      .where(
        inArray(
          messages.conversationId,
          convIds.map((c) => c.id),
        ),
      )
      .groupBy(messages.conversationId)

    const convChannelMap = new Map(convIds.map((c) => [c.id, c.channelId]))
    const perChannel: Record<string, number> = {}
    for (const m of msgData) {
      const chId = convChannelMap.get(m.conversationId)
      if (chId) {
        perChannel[chId] = (perChannel[chId] ?? 0) + m.count
      }
    }
    msgCountPerChannel = new Map(Object.entries(perChannel))
  }

  const convCountPerChannel = new Map(convData.map((c) => [c.channelId, c.count]))

  return workspaceAgents.map((agent) => {
    const agentChs = agentChannels.filter((c) => c.agentId === agent.id)
    let conversationCount = 0
    let messageCount = 0
    for (const ch of agentChs) {
      conversationCount += convCountPerChannel.get(ch.id) ?? 0
      messageCount += msgCountPerChannel.get(ch.id) ?? 0
    }
    return {
      agentId: agent.id,
      agentName: agent.name,
      conversationCount,
      messageCount,
    }
  })
}

export async function getChannelDistribution(
  db: DatabaseClient,
  workspaceIds: string[],
): Promise<ChannelDistribution[]> {
  if (workspaceIds.length === 0) return []

  const result = await db
    .select({
      channelType: channels.type,
      conversationCount: sql<number>`count(conversations.id)::int`,
    })
    .from(channels)
    .leftJoin(
      conversations,
      and(eq(conversations.channelId, channels.id), eq(conversations.isTest, false)),
    )
    .where(
      inArray(
        channels.agentId,
        db.select({ id: agents.id }).from(agents).where(inArray(agents.workspaceId, workspaceIds)),
      ),
    )
    .groupBy(channels.type)

  return result.map((r) => ({
    channelType: r.channelType,
    conversationCount: r.conversationCount,
  }))
}

export async function trackEvent(
  db: DatabaseClient,
  event: {
    workspaceId: string
    eventType: string
    payload?: Record<string, unknown>
  },
) {
  await db.insert(analyticsEvents).values({
    workspaceId: event.workspaceId,
    eventType: event.eventType,
    payload: event.payload ?? {},
  })
}
