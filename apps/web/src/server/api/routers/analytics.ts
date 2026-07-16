import { z } from "zod"

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
    const workspaceIds = ctx.workspaceId ? [ctx.workspaceId] : []
    return getOverview(ctx.db, workspaceIds)
  }),

  conversationVolume: protectedProcedure
    .input(z.object({ days: z.number().min(1).max(365).default(30) }))
    .query(async ({ ctx, input }) => {
      const workspaceIds = ctx.workspaceId ? [ctx.workspaceId] : []
      return getConversationVolume(ctx.db, workspaceIds, input.days)
    }),

  statusDistribution: protectedProcedure.query(async ({ ctx }) => {
    const workspaceIds = ctx.workspaceId ? [ctx.workspaceId] : []
    return getStatusDistribution(ctx.db, workspaceIds)
  }),

  agentRanking: protectedProcedure.query(async ({ ctx }) => {
    const workspaceIds = ctx.workspaceId ? [ctx.workspaceId] : []
    return getAgentRanking(ctx.db, workspaceIds)
  }),

  channelDistribution: protectedProcedure.query(async ({ ctx }) => {
    const workspaceIds = ctx.workspaceId ? [ctx.workspaceId] : []
    return getChannelDistribution(ctx.db, workspaceIds)
  }),
})
