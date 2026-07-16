import { z } from "zod"
import { eq } from "drizzle-orm"
import { apiKeys, apiKeyScopes } from "@chaste-ai/db"
import { createInsertSchema } from "drizzle-zod"
import { TRPCError } from "@trpc/server"
import { protectedProcedure, router } from "../trpc"
import { randomBytes, createHash } from "crypto"

const insertApiKeySchema = createInsertSchema(apiKeys, {
  scopes: z.array(z.enum(apiKeyScopes)),
}).pick({
  name: true,
  scopes: true,
  expiresAt: true,
})

function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const raw = `chaste_${randomBytes(32).toString("hex")}`
  const hash = createHash("sha256").update(raw).digest("hex")
  const prefix = raw.slice(0, 12)
  return { raw, hash, prefix }
}

export const apiKeyRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.workspaceId) return []

    return ctx.db
      .select({
        id: apiKeys.id,
        workspaceId: apiKeys.workspaceId,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        scopes: apiKeys.scopes,
        expiresAt: apiKeys.expiresAt,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.workspaceId, ctx.workspaceId))
      .orderBy(apiKeys.createdAt)
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [key] = await ctx.db.select().from(apiKeys).where(eq(apiKeys.id, input.id)).limit(1)

      if (!key || key.workspaceId !== ctx.workspaceId) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const { keyHash: _kh, ...keyDto } = key
      return keyDto
    }),

  create: protectedProcedure.input(insertApiKeySchema).mutation(async ({ ctx, input }) => {
    if (!ctx.workspaceId) throw new TRPCError({ code: "FORBIDDEN" })

    const { raw, hash, prefix } = generateApiKey()

    const [key] = await ctx.db
      .insert(apiKeys)
      .values({
        workspaceId: ctx.workspaceId,
        name: input.name,
        keyHash: hash,
        keyPrefix: prefix,
        scopes: input.scopes,
        expiresAt: input.expiresAt ?? null,
      })
      .returning()

    if (!key) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
    }
    return { ...key, rawKey: raw }
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: z.object({
          name: z.string().optional(),
          scopes: z.array(z.enum(apiKeyScopes)).optional(),
          expiresAt: z.string().datetime().optional().nullable(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.id, input.id))
        .limit(1)

      if (!existing || existing.workspaceId !== ctx.workspaceId) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const updateData: Record<string, unknown> = {}
      if (input.data.name !== undefined) updateData.name = input.data.name
      if (input.data.scopes !== undefined) updateData.scopes = input.data.scopes
      if (input.data.expiresAt !== undefined) {
        updateData.expiresAt = input.data.expiresAt ? new Date(input.data.expiresAt) : null
      }

      if (Object.keys(updateData).length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No fields to update" })
      }

      const [key] = await ctx.db
        .update(apiKeys)
        .set(updateData)
        .where(eq(apiKeys.id, input.id))
        .returning()

      if (!key) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const { keyHash: _kh, ...keyDto } = key
      return keyDto
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.id, input.id))
        .limit(1)

      if (!existing || existing.workspaceId !== ctx.workspaceId) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      await ctx.db.delete(apiKeys).where(eq(apiKeys.id, input.id))
      return { success: true }
    }),
})
