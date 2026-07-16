import { z } from "zod"
import { eq, and, inArray } from "drizzle-orm"
import { agentDocuments, documents, agents } from "@chaste-ai/db"
import { TRPCError } from "@trpc/server"
import { protectedProcedure, router } from "../trpc"

export const agentKnowledgeRouter = router({
  getAssignedDocuments: protectedProcedure
    .input(z.object({ agentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [agent] = await ctx.db
        .select()
        .from(agents)
        .where(eq(agents.id, input.agentId))
        .limit(1)

      if (!agent || agent.workspaceId !== ctx.workspaceId) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const links = await ctx.db
        .select()
        .from(agentDocuments)
        .where(eq(agentDocuments.agentId, input.agentId))

      if (links.length === 0) return []

      const docIds = links.map((l) => l.documentId)
      const docs = await ctx.db.select().from(documents).where(inArray(documents.id, docIds))

      return docs.map((doc) => ({
        ...doc,
        assignedAt: links.find((l) => l.documentId === doc.id)?.createdAt,
      }))
    }),

  getWorkspaceDocuments: protectedProcedure
    .input(z.object({ agentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [agent] = await ctx.db
        .select()
        .from(agents)
        .where(eq(agents.id, input.agentId))
        .limit(1)

      if (!agent || agent.workspaceId !== ctx.workspaceId) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      return ctx.db.select().from(documents).where(eq(documents.workspaceId, ctx.workspaceId))
    }),

  assignDocument: protectedProcedure
    .input(z.object({ agentId: z.string().uuid(), documentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [agent] = await ctx.db
        .select()
        .from(agents)
        .where(eq(agents.id, input.agentId))
        .limit(1)

      if (!agent || agent.workspaceId !== ctx.workspaceId) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const [existing] = await ctx.db
        .select()
        .from(agentDocuments)
        .where(
          and(
            eq(agentDocuments.agentId, input.agentId),
            eq(agentDocuments.documentId, input.documentId),
          ),
        )
        .limit(1)

      if (existing) return { success: true }

      await ctx.db.insert(agentDocuments).values({
        agentId: input.agentId,
        documentId: input.documentId,
      })

      return { success: true }
    }),

  unassignDocument: protectedProcedure
    .input(z.object({ agentId: z.string().uuid(), documentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [agent] = await ctx.db
        .select()
        .from(agents)
        .where(eq(agents.id, input.agentId))
        .limit(1)

      if (!agent || agent.workspaceId !== ctx.workspaceId) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      await ctx.db
        .delete(agentDocuments)
        .where(
          and(
            eq(agentDocuments.agentId, input.agentId),
            eq(agentDocuments.documentId, input.documentId),
          ),
        )

      return { success: true }
    }),

  updateInstructions: protectedProcedure
    .input(z.object({ agentId: z.string().uuid(), instructions: z.string().nullable() }))
    .mutation(async ({ ctx, input }) => {
      const [agent] = await ctx.db
        .select()
        .from(agents)
        .where(eq(agents.id, input.agentId))
        .limit(1)

      if (!agent || agent.workspaceId !== ctx.workspaceId) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      await ctx.db
        .update(agents)
        .set({ knowledgeInstructions: input.instructions })
        .where(eq(agents.id, input.agentId))

      return { success: true }
    }),
})
