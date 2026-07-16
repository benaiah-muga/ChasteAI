import { z } from "zod"
import { eq, desc, inArray, and } from "drizzle-orm"
import { conversations, messages, channels, agents } from "@chaste-ai/db"
import { TRPCError } from "@trpc/server"
import { protectedProcedure, router } from "../trpc"

export const conversationRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          agentId: z.string().uuid().optional(),
          includeTest: z.boolean().default(true),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.workspaceId) return []

      const conditions = [eq(agents.workspaceId, ctx.workspaceId)]
      if (input?.agentId) {
        conditions.push(eq(agents.id, input.agentId))
      }

      const userAgents = await ctx.db
        .select({ id: agents.id })
        .from(agents)
        .where(and(...conditions))

      if (userAgents.length === 0) return []

      const agentIds = userAgents.map((a) => a.id)

      const userChannels = await ctx.db
        .select()
        .from(channels)
        .where(inArray(channels.agentId, agentIds))

      const channelIds = userChannels.map((c) => c.id)
      if (channelIds.length === 0) return []

      const convConditions: ReturnType<typeof eq>[] = [inArray(conversations.channelId, channelIds)]
      if (input && !input.includeTest) {
        convConditions.push(eq(conversations.isTest, false))
      }

      return ctx.db
        .select()
        .from(conversations)
        .where(and(...convConditions))
        .orderBy(desc(conversations.updatedAt))
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [conversation] = await ctx.db
        .select()
        .from(conversations)
        .where(eq(conversations.id, input.id))
        .limit(1)

      if (!conversation) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const [channel] = await ctx.db
        .select()
        .from(channels)
        .where(eq(channels.id, conversation.channelId))
        .limit(1)

      if (!channel) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const [agent] = await ctx.db
        .select()
        .from(agents)
        .where(eq(agents.id, channel.agentId))
        .limit(1)

      if (!agent || agent.workspaceId !== ctx.workspaceId) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      const messageList = await ctx.db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversation.id))
        .orderBy(messages.createdAt)

      return { conversation, messages: messageList }
    }),
})
