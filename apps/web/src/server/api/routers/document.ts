import { z } from "zod"
import { eq, and, inArray } from "drizzle-orm"
import {
  documents,
  documentSources,
  documentStatuses,
  documentChunks,
  memberships,
} from "@chaste-ai/db"
import { createInsertSchema } from "drizzle-zod"
import { TRPCError } from "@trpc/server"
import { protectedProcedure, router } from "../trpc"

const insertDocumentSchema = createInsertSchema(documents, {
  sourceType: z.enum(documentSources),
  status: z.enum(documentStatuses).optional(),
}).pick({
  workspaceId: true,
  sourceType: true,
  sourceUrl: true,
  title: true,
  metadata: true,
})

export const documentRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const userWorkspaces = await ctx.db
      .select({ workspaceId: memberships.workspaceId })
      .from(memberships)
      .where(eq(memberships.userId, ctx.session.user.id))

    if (userWorkspaces.length === 0) return []

    const workspaceIds = userWorkspaces.map((w) => w.workspaceId)

    return ctx.db
      .select()
      .from(documents)
      .where(inArray(documents.workspaceId, workspaceIds))
      .orderBy(documents.createdAt)
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [doc] = await ctx.db.select().from(documents).where(eq(documents.id, input.id)).limit(1)

      if (!doc) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const [membership] = await ctx.db
        .select()
        .from(memberships)
        .where(
          and(
            eq(memberships.workspaceId, doc.workspaceId),
            eq(memberships.userId, ctx.session.user.id),
          ),
        )
        .limit(1)

      if (!membership) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const chunks = await ctx.db
        .select({
          id: documentChunks.id,
          documentId: documentChunks.documentId,
          content: documentChunks.content,
          chunkIndex: documentChunks.chunkIndex,
          metadata: documentChunks.metadata,
          createdAt: documentChunks.createdAt,
        })
        .from(documentChunks)
        .where(eq(documentChunks.documentId, doc.id))
        .orderBy(documentChunks.chunkIndex)

      return { document: doc, chunks }
    }),

  create: protectedProcedure.input(insertDocumentSchema).mutation(async ({ ctx, input }) => {
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

    const [doc] = await ctx.db
      .insert(documents)
      .values({
        ...input,
        status: "pending",
      })
      .returning()

    if (!doc) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
    }

    return doc
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(documents)
        .where(eq(documents.id, input.id))
        .limit(1)

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

      await ctx.db.transaction(async (tx) => {
        await tx.delete(documentChunks).where(eq(documentChunks.documentId, input.id))
        await tx.delete(documents).where(eq(documents.id, input.id))
      })

      return { success: true }
    }),
})
