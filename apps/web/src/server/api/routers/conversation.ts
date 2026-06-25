import { z } from "zod"
import { eq, and, desc, inArray } from "drizzle-orm"
import { conversations, messages, channels, agents, memberships } from "@chaste-ai/db"
import { TRPCError } from "@trpc/server"
import { protectedProcedure, router } from "../trpc"

export const conversationRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          agentId: z.string().uuid().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const userWorkspaces = await ctx.db
        .select({ workspaceId: memberships.workspaceId })
        .from(memberships)
        .where(eq(memberships.userId, ctx.session.user.id))

      if (userWorkspaces.length === 0) return []

      const workspaceIds = userWorkspaces.map((w) => w.workspaceId)

      const userAgents = await ctx.db
        .select()
        .from(agents)
        .where(inArray(agents.workspaceId, workspaceIds))

      if (userAgents.length === 0) return []

      const agentIds = userAgents.map((a) => a.id)

      let userChannels = await ctx.db
        .select()
        .from(channels)
        .where(inArray(channels.agentId, agentIds))

      if (input?.agentId) {
        userChannels = userChannels.filter((c) => c.agentId === input.agentId)
      }

      if (userChannels.length === 0) return []

      const channelIds = userChannels.map((c) => c.id)

      return ctx.db
        .select()
        .from(conversations)
        .where(inArray(conversations.channelId, channelIds))
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

      if (!agent) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const [membership] = await ctx.db
        .select()
        .from(memberships)
        .where(
          and(
            eq(memberships.workspaceId, agent.workspaceId),
            eq(memberships.userId, ctx.session.user.id),
          ),
        )
        .limit(1)

      if (!membership) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      const messageList = await ctx.db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversation.id))
        .orderBy(messages.createdAt)

      return { conversation, messages: messageList }
    }),

  create: protectedProcedure
    .input(
      z.object({
        agentId: z.string().uuid(),
        externalUserId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [agent] = await ctx.db
        .select()
        .from(agents)
        .where(eq(agents.id, input.agentId))
        .limit(1)

      if (!agent) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" })
      }

      const [membership] = await ctx.db
        .select()
        .from(memberships)
        .where(
          and(
            eq(memberships.workspaceId, agent.workspaceId),
            eq(memberships.userId, ctx.session.user.id),
          ),
        )
        .limit(1)

      if (!membership) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      const result = await ctx.db.transaction(async (tx) => {
        let [channel] = await tx
          .select()
          .from(channels)
          .where(and(eq(channels.agentId, input.agentId), eq(channels.type, "web")))
          .limit(1)
          .for("update")

        if (!channel) {
          ;[channel] = await tx
            .insert(channels)
            .values({
              agentId: input.agentId,
              type: "web",
              name: `${agent.name} Web`,
            })
            .returning()
        }

        if (!channel) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
        }

        const [conversation] = await tx
          .insert(conversations)
          .values({
            channelId: channel.id,
            externalUserId: input.externalUserId ?? ctx.session.user.id,
          })
          .returning()

        return conversation
      })

      return result
    }),
})
