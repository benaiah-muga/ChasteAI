import { z } from "zod"
import { eq, and, inArray } from "drizzle-orm"
import { apiKeys, apiKeyScopes, memberships } from "@chaste-ai/db"
import { createInsertSchema } from "drizzle-zod"
import { TRPCError } from "@trpc/server"
import { protectedProcedure, router } from "../trpc"
import { randomBytes, createHash } from "crypto"

const insertApiKeySchema = createInsertSchema(apiKeys, {
  scopes: z.array(z.enum(apiKeyScopes)),
}).pick({
  workspaceId: true,
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
    const userWorkspaces = await ctx.db
      .select({ workspaceId: memberships.workspaceId })
      .from(memberships)
      .where(eq(memberships.userId, ctx.session.user.id))

    if (userWorkspaces.length === 0) return []

    const workspaceIds = userWorkspaces.map((w) => w.workspaceId)

    return ctx.db
      .select()
      .from(apiKeys)
      .where(inArray(apiKeys.workspaceId, workspaceIds))
      .orderBy(apiKeys.createdAt)
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [key] = await ctx.db.select().from(apiKeys).where(eq(apiKeys.id, input.id)).limit(1)

      if (!key) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const [membership] = await ctx.db
        .select()
        .from(memberships)
        .where(
          and(
            eq(memberships.workspaceId, key.workspaceId),
            eq(memberships.userId, ctx.session.user.id),
          ),
        )
        .limit(1)

      if (!membership) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      return key
    }),

  create: protectedProcedure.input(insertApiKeySchema).mutation(async ({ ctx, input }) => {
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

    const { raw, hash, prefix } = generateApiKey()

    const [key] = await ctx.db
      .insert(apiKeys)
      .values({
        workspaceId: input.workspaceId,
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

      const updateData: Record<string, unknown> = {}
      if (input.data.name !== undefined) updateData.name = input.data.name
      if (input.data.scopes !== undefined) updateData.scopes = input.data.scopes
      if (input.data.expiresAt !== undefined) {
        updateData.expiresAt = input.data.expiresAt ? new Date(input.data.expiresAt) : null
      }

      const [key] = await ctx.db
        .update(apiKeys)
        .set(updateData)
        .where(eq(apiKeys.id, input.id))
        .returning()

      if (!key) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      return key
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.id, input.id))
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

      await ctx.db.delete(apiKeys).where(eq(apiKeys.id, input.id))
      return { success: true }
    }),
})
