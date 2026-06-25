import { z } from "zod"
import { eq, and, inArray } from "drizzle-orm"
import {
  agents,
  agentStatuses,
  channels,
  conversations,
  messages,
  memberships,
} from "@chaste-ai/db"
import { createInsertSchema } from "drizzle-zod"
import { TRPCError } from "@trpc/server"
import { protectedProcedure, router } from "../trpc"

const insertAgentSchema = createInsertSchema(agents, {
  status: z.enum(agentStatuses),
  providerConfig: z.record(z.unknown()),
}).pick({
  name: true,
  description: true,
  systemPrompt: true,
  status: true,
  providerConfig: true,
})

const updateAgentSchema = insertAgentSchema.partial()

export const agentRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const userWorkspaces = await ctx.db
      .select({ workspaceId: memberships.workspaceId })
      .from(memberships)
      .where(eq(memberships.userId, ctx.session.user.id))

    if (userWorkspaces.length === 0) return []

    const workspaceIds = userWorkspaces.map((w) => w.workspaceId)

    return ctx.db
      .select()
      .from(agents)
      .where(inArray(agents.workspaceId, workspaceIds))
      .orderBy(agents.createdAt)
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [agent] = await ctx.db.select().from(agents).where(eq(agents.id, input.id)).limit(1)

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

      return agent
    }),

  create: protectedProcedure
    .input(
      insertAgentSchema.extend({
        workspaceId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [membership] = await ctx.db
        .select()
        .from(memberships)
        .where(
          and(
            eq(memberships.workspaceId, input.workspaceId),
            eq(memberships.userId, ctx.session.user.id),
          ),
        )
        .limit(1)

      if (!membership) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      const [agent] = await ctx.db.insert(agents).values(input).returning()

      if (!agent) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }

      return agent
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateAgentSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db.select().from(agents).where(eq(agents.id, input.id)).limit(1)

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const [membership] = await ctx.db
        .select()
        .from(memberships)
        .where(
          and(
            eq(memberships.workspaceId, existing.workspaceId),
            eq(memberships.userId, ctx.session.user.id),
          ),
        )
        .limit(1)

      if (!membership) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      const [agent] = await ctx.db
        .update(agents)
        .set(input.data)
        .where(eq(agents.id, input.id))
        .returning()

      return agent
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db.select().from(agents).where(eq(agents.id, input.id)).limit(1)

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const [membership] = await ctx.db
        .select()
        .from(memberships)
        .where(
          and(
            eq(memberships.workspaceId, existing.workspaceId),
            eq(memberships.userId, ctx.session.user.id),
          ),
        )
        .limit(1)

      if (!membership) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      const agentChannels = await ctx.db
        .select({ id: channels.id })
        .from(channels)
        .where(eq(channels.agentId, input.id))

      const channelIds = agentChannels.map((c) => c.id)

      if (channelIds.length > 0) {
        const channelConversations = await ctx.db
          .select({ id: conversations.id })
          .from(conversations)
          .where(inArray(conversations.channelId, channelIds))

        const conversationIds = channelConversations.map((c) => c.id)

        if (conversationIds.length > 0) {
          await ctx.db.delete(messages).where(inArray(messages.conversationId, conversationIds))
          await ctx.db.delete(conversations).where(inArray(conversations.id, conversationIds))
        }

        await ctx.db.delete(channels).where(inArray(channels.id, channelIds))
      }

      await ctx.db.delete(agents).where(eq(agents.id, input.id))
      return { success: true }
    }),
})
