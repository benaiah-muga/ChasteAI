import { z } from "zod"
import { eq } from "drizzle-orm"
import { documents, documentSources, documentStatuses, documentChunks } from "@chaste-ai/db"
import { createInsertSchema } from "drizzle-zod"
import { TRPCError } from "@trpc/server"
import { protectedProcedure, router } from "../trpc"

const insertDocumentSchema = createInsertSchema(documents, {
  sourceType: z.enum(documentSources),
  status: z.enum(documentStatuses).optional(),
}).pick({
  sourceType: true,
  sourceUrl: true,
  title: true,
  metadata: true,
})

export const documentRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.workspaceId) return []
    return ctx.db
      .select()
      .from(documents)
      .where(eq(documents.workspaceId, ctx.workspaceId))
      .orderBy(documents.createdAt)
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [doc] = await ctx.db.select().from(documents).where(eq(documents.id, input.id)).limit(1)

      if (!doc) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      if (doc.workspaceId !== ctx.workspaceId) {
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
    if (!ctx.workspaceId) throw new TRPCError({ code: "FORBIDDEN" })

    const [doc] = await ctx.db
      .insert(documents)
      .values({
        ...input,
        workspaceId: ctx.workspaceId,
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

      if (!existing || existing.workspaceId !== ctx.workspaceId) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      await ctx.db.transaction(async (tx) => {
        await tx.delete(documentChunks).where(eq(documentChunks.documentId, input.id))
        await tx.delete(documents).where(eq(documents.id, input.id))
      })

      return { success: true }
    }),
})
