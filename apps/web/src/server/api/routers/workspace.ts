import { z } from "zod"
import { eq, and, inArray } from "drizzle-orm"
import {
  workspaces,
  memberships,
  agents,
  channels,
  conversations,
  messages,
  documents,
  documentChunks,
  apiKeys,
  subscriptions,
  analyticsEvents,
  invitations,
} from "@chaste-ai/db"
import { createInsertSchema } from "drizzle-zod"
import { TRPCError } from "@trpc/server"
import { protectedProcedure, router } from "../trpc"

const insertWorkspaceSchema = createInsertSchema(workspaces).pick({
  name: true,
  slug: true,
  description: true,
})

export const workspaceRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(workspaces)
      .innerJoin(memberships, eq(memberships.workspaceId, workspaces.id))
      .where(eq(memberships.userId, ctx.session.user.id))
  }),

  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const [workspace] = await ctx.db
        .select()
        .from(workspaces)
        .where(eq(workspaces.slug, input.slug))
        .limit(1)

      if (!workspace) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" })
      }
      return workspace
    }),

  create: protectedProcedure.input(insertWorkspaceSchema).mutation(async ({ ctx, input }) => {
    const [workspace] = await ctx.db.insert(workspaces).values(input).returning()

    if (!workspace) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
    }

    await ctx.db.insert(memberships).values({
      workspaceId: workspace.id,
      userId: ctx.session.user.id,
      role: "owner",
    })

    return workspace
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      const [workspace] = await ctx.db
        .update(workspaces)
        .set(data)
        .where(eq(workspaces.id, id))
        .returning()

      if (!workspace) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }
      return workspace
    }),

  updateSettings: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        sessionTimeoutEnabled: z.boolean().optional(),
        idleTimeoutMinutes: z.number().min(1).max(1440).optional(),
        maxSessionHours: z.number().min(1).max(720).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...settings } = input
      const [workspace] = await ctx.db
        .update(workspaces)
        .set({ settings: settings as Record<string, unknown> })
        .where(eq(workspaces.id, id))
        .returning()

      if (!workspace) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }
      return workspace
    }),

  getSettings: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [workspace] = await ctx.db
        .select({ settings: workspaces.settings })
        .from(workspaces)
        .where(eq(workspaces.id, input.id))
        .limit(1)

      if (!workspace) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }
      return workspace.settings as Record<string, unknown>
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, input.id))
        .limit(1)

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const [membership] = await ctx.db
        .select()
        .from(memberships)
        .where(
          and(eq(memberships.workspaceId, input.id), eq(memberships.userId, ctx.session.user.id)),
        )
        .limit(1)

      if (!membership || membership.role !== "owner") {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      await ctx.db.transaction(async (tx) => {
        const workspaceAgents = await tx
          .select({ id: agents.id })
          .from(agents)
          .where(eq(agents.workspaceId, input.id))

        const agentIds = workspaceAgents.map((a) => a.id)

        if (agentIds.length > 0) {
          const agentChannels = await tx
            .select({ id: channels.id })
            .from(channels)
            .where(inArray(channels.agentId, agentIds))

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

          await tx.delete(agents).where(inArray(agents.id, agentIds))
        }

        const workspaceDocs = await tx
          .select({ id: documents.id })
          .from(documents)
          .where(eq(documents.workspaceId, input.id))

        const docIds = workspaceDocs.map((d) => d.id)

        if (docIds.length > 0) {
          await tx.delete(documentChunks).where(inArray(documentChunks.documentId, docIds))
          await tx.delete(documents).where(inArray(documents.id, docIds))
        }

        await tx.delete(apiKeys).where(eq(apiKeys.workspaceId, input.id))
        await tx.delete(subscriptions).where(eq(subscriptions.workspaceId, input.id))
        await tx.delete(analyticsEvents).where(eq(analyticsEvents.workspaceId, input.id))
        await tx.delete(invitations).where(eq(invitations.workspaceId, input.id))
        await tx.delete(memberships).where(eq(memberships.workspaceId, input.id))
        await tx.delete(workspaces).where(eq(workspaces.id, input.id))
      })

      return { success: true }
    }),
})
