import { z } from "zod"
import { eq } from "drizzle-orm"
import { workspaces, memberships } from "@chaste-ai/db"
import { createInsertSchema } from "drizzle-zod"
import { TRPCError } from "@trpc/server"
import { protectedProcedure, router } from "../trpc"

const insertWorkspaceSchema = createInsertSchema(workspaces).pick({
  name: true,
  slug: true,
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

  create: protectedProcedure
    .input(insertWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      const [workspace] = await ctx.db
        .insert(workspaces)
        .values(input)
        .returning()

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
})
