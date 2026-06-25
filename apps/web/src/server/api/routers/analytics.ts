import { z } from "zod"
import { eq } from "drizzle-orm"
import { memberships } from "@chaste-ai/db"
import {
  getOverview,
  getConversationVolume,
  getStatusDistribution,
  getAgentRanking,
  getChannelDistribution,
} from "@chaste-ai/analytics"
import { protectedProcedure, router } from "../trpc"

export const analyticsRouter = router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    const userWorkspaces = await ctx.db
      .select({ workspaceId: memberships.workspaceId })
      .from(memberships)
      .where(eq(memberships.userId, ctx.session.user.id))

    const workspaceIds = userWorkspaces.map((w) => w.workspaceId)
    return getOverview(ctx.db, workspaceIds)
  }),

  conversationVolume: protectedProcedure
    .input(z.object({ days: z.number().min(1).max(365).default(30) }))
    .query(async ({ ctx, input }) => {
      const userWorkspaces = await ctx.db
        .select({ workspaceId: memberships.workspaceId })
        .from(memberships)
        .where(eq(memberships.userId, ctx.session.user.id))

      const workspaceIds = userWorkspaces.map((w) => w.workspaceId)
      return getConversationVolume(ctx.db, workspaceIds, input.days)
    }),

  statusDistribution: protectedProcedure.query(async ({ ctx }) => {
    const userWorkspaces = await ctx.db
      .select({ workspaceId: memberships.workspaceId })
      .from(memberships)
      .where(eq(memberships.userId, ctx.session.user.id))

    const workspaceIds = userWorkspaces.map((w) => w.workspaceId)
    return getStatusDistribution(ctx.db, workspaceIds)
  }),

  agentRanking: protectedProcedure.query(async ({ ctx }) => {
    const userWorkspaces = await ctx.db
      .select({ workspaceId: memberships.workspaceId })
      .from(memberships)
      .where(eq(memberships.userId, ctx.session.user.id))

    const workspaceIds = userWorkspaces.map((w) => w.workspaceId)
    return getAgentRanking(ctx.db, workspaceIds)
  }),

  channelDistribution: protectedProcedure.query(async ({ ctx }) => {
    const userWorkspaces = await ctx.db
      .select({ workspaceId: memberships.workspaceId })
      .from(memberships)
      .where(eq(memberships.userId, ctx.session.user.id))

    const workspaceIds = userWorkspaces.map((w) => w.workspaceId)
    return getChannelDistribution(ctx.db, workspaceIds)
  }),
})
