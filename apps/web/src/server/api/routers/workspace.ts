import { z } from "zod"
import { eq } from "drizzle-orm"
import { workspaces } from "@chaste-ai/db"
import { TRPCError } from "@trpc/server"
import { protectedProcedure, router } from "../trpc"

export const workspaceRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.workspaceId) return null
    const [workspace] = await ctx.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, ctx.workspaceId))
      .limit(1)
    return workspace ?? null
  }),

  getSettings: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.workspaceId) return null
    const [workspace] = await ctx.db
      .select({ settings: workspaces.settings })
      .from(workspaces)
      .where(eq(workspaces.id, ctx.workspaceId))
      .limit(1)
    return (workspace?.settings ?? {}) as Record<string, unknown>
  }),

  updateSettings: protectedProcedure
    .input(
      z.object({
        sessionTimeoutEnabled: z.boolean().optional(),
        idleTimeoutMinutes: z.number().min(1).max(1440).optional(),
        maxSessionHours: z.number().min(1).max(720).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.workspaceId) throw new TRPCError({ code: "FORBIDDEN" })
      const [workspace] = await ctx.db
        .update(workspaces)
        .set({ settings: input as Record<string, unknown> })
        .where(eq(workspaces.id, ctx.workspaceId))
        .returning()
      if (!workspace) throw new TRPCError({ code: "NOT_FOUND" })
      return workspace
    }),
})
