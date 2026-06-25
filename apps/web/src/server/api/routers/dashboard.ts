import { eq, inArray, sql } from "drizzle-orm"
import { agents, conversations, channels, messages, memberships } from "@chaste-ai/db"
import { protectedProcedure, router } from "../trpc"

export const dashboardRouter = router({
  stats: protectedProcedure.query(async ({ ctx }) => {
    const userWorkspaces = await ctx.db
      .select({ workspaceId: memberships.workspaceId })
      .from(memberships)
      .where(eq(memberships.userId, ctx.session.user.id))

    if (userWorkspaces.length === 0) {
      return { agentCount: 0, conversationCount: 0, channelCount: 0, messageCount: 0 }
    }

    const workspaceIds = userWorkspaces.map((w) => w.workspaceId)

    const userAgents = await ctx.db
      .select()
      .from(agents)
      .where(inArray(agents.workspaceId, workspaceIds))

    const agentIds = userAgents.map((a) => a.id)
    const agentCount = agentIds.length

    if (agentCount === 0) {
      return { agentCount: 0, conversationCount: 0, channelCount: 0, messageCount: 0 }
    }

    const userChannels = await ctx.db
      .select()
      .from(channels)
      .where(inArray(channels.agentId, agentIds))

    const channelIds = userChannels.map((c) => c.id)
    const channelCount = channelIds.length

    if (channelCount === 0) {
      return { agentCount, conversationCount: 0, channelCount: 0, messageCount: 0 }
    }

    const userConversations = await ctx.db
      .select()
      .from(conversations)
      .where(inArray(conversations.channelId, channelIds))

    const conversationIds = userConversations.map((c) => c.id)
    const conversationCount = conversationIds.length

    if (conversationCount === 0) {
      return { agentCount, conversationCount: 0, channelCount, messageCount: 0 }
    }

    const messageResult = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(messages)
      .where(inArray(messages.conversationId, conversationIds))

    const messageCount = messageResult[0]?.count ?? 0

    return { agentCount, conversationCount, channelCount, messageCount }
  }),

  recentConversations: protectedProcedure.query(async ({ ctx }) => {
    const userWorkspaces = await ctx.db
      .select({ workspaceId: memberships.workspaceId })
      .from(memberships)
      .where(eq(memberships.userId, ctx.session.user.id))

    if (userWorkspaces.length === 0) return []

    const workspaceIds = userWorkspaces.map((w) => w.workspaceId)

    const userAgents = await ctx.db
      .select({ id: agents.id, name: agents.name })
      .from(agents)
      .where(inArray(agents.workspaceId, workspaceIds))

    const agentIds = userAgents.map((a) => a.id)
    if (agentIds.length === 0) return []

    const userChannels = await ctx.db
      .select({ id: channels.id, agentId: channels.agentId })
      .from(channels)
      .where(inArray(channels.agentId, agentIds))

    const channelIds = userChannels.map((c) => c.id)
    if (channelIds.length === 0) return []

    const recentConversations = await ctx.db
      .select()
      .from(conversations)
      .where(inArray(conversations.channelId, channelIds))
      .orderBy(conversations.updatedAt)
      .limit(10)

    const agentMap = new Map(userAgents.map((a) => [a.id, a.name]))

    return recentConversations.map((c) => {
      const ch = userChannels.find((ch) => ch.id === c.channelId)
      return {
        ...c,
        agentName: ch ? (agentMap.get(ch.agentId) ?? "Unknown") : "Unknown",
      }
    })
  }),
})
