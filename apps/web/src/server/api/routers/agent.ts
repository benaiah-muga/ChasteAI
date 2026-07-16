import { z } from "zod"
import { eq, and, inArray } from "drizzle-orm"
import {
  agents,
  agentStatuses,
  channels,
  conversations,
  messages,
  agentDocuments,
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
  knowledgeInstructions: true,
  status: true,
  providerConfig: true,
})

const updateAgentSchema = insertAgentSchema.partial()

export const agentRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.workspaceId) return []

    const agentList = await ctx.db
      .select()
      .from(agents)
      .where(eq(agents.workspaceId, ctx.workspaceId))
      .orderBy(agents.createdAt)

    if (agentList.length === 0) return []

    const agentIds = agentList.map((a) => a.id)
    const agentChannels = await ctx.db
      .select()
      .from(channels)
      .where(inArray(channels.agentId, agentIds))

    const channelsByAgent = new Map<string, typeof agentChannels>()
    for (const ch of agentChannels) {
      const list = channelsByAgent.get(ch.agentId) ?? []
      list.push(ch)
      channelsByAgent.set(ch.agentId, list)
    }

    return agentList.map((a) => ({
      ...a,
      channels: channelsByAgent.get(a.id) ?? [],
    }))
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [agent] = await ctx.db
        .select()
        .from(agents)
        .where(and(eq(agents.id, input.id), eq(agents.workspaceId, ctx.workspaceId ?? "")))
        .limit(1)

      if (!agent) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }
      return agent
    }),

  create: protectedProcedure.input(insertAgentSchema).mutation(async ({ ctx, input }) => {
    if (!ctx.workspaceId) throw new TRPCError({ code: "FORBIDDEN" })

    const [agent] = await ctx.db
      .insert(agents)
      .values({ ...input, workspaceId: ctx.workspaceId })
      .returning()

    if (!agent) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
    }

    await ctx.db.insert(channels).values({
      agentId: agent.id,
      type: "widget",
      name: "Web Widget",
      config: {},
      isActive: "true",
    })

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

      if (existing.workspaceId !== ctx.workspaceId) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      const [agent] = await ctx.db
        .update(agents)
        .set(input.data)
        .where(eq(agents.id, input.id))
        .returning()

      if (!agent) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }
      return agent
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(agents)
        .where(and(eq(agents.id, input.id), eq(agents.workspaceId, ctx.workspaceId ?? "")))
        .limit(1)

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      await ctx.db.transaction(async (tx) => {
        const agentChannels = await tx
          .select({ id: channels.id })
          .from(channels)
          .where(eq(channels.agentId, input.id))

        const channelIds = agentChannels.map((c) => c.id)

        if (channelIds.length > 0) {
          const channelConversations = await tx
            .select({ id: conversations.id })
            .from(conversations)
            .where(inArray(conversations.channelId, channelIds))

          const conversationIds = channelConversations.map((c) => c.id)

          if (conversationIds.length > 0) {
            await tx.delete(messages).where(inArray(messages.conversationId, conversationIds))
            await tx.delete(conversations).where(inArray(conversations.id, conversationIds))
          }
          await tx.delete(channels).where(inArray(channels.id, channelIds))
        }

        await tx.delete(agentDocuments).where(eq(agentDocuments.agentId, input.id))
        await tx.delete(agents).where(eq(agents.id, input.id))
      })

      return { success: true }
    }),
})
