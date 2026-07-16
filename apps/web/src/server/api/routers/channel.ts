import { z } from "zod"
import { eq } from "drizzle-orm"
import { channels, channelTypes, agents } from "@chaste-ai/db"
import {
  telegramConfigSchema,
  widgetConfigSchema,
  webConfigSchema,
  apiConfigSchema,
} from "@chaste-ai/db"
import { createInsertSchema } from "drizzle-zod"
import { TRPCError } from "@trpc/server"
import { protectedProcedure, router } from "../trpc"

const typeConfigSchemas: Record<string, z.ZodTypeAny> = {
  telegram: telegramConfigSchema,
  widget: widgetConfigSchema,
  web: webConfigSchema,
  api: apiConfigSchema,
}

const baseChannelSchema = createInsertSchema(channels, {
  type: z.enum(channelTypes),
  config: z.record(z.unknown()).optional(),
}).pick({
  agentId: true,
  type: true,
  name: true,
  config: true,
  isActive: true,
})

const insertChannelSchema = baseChannelSchema.superRefine((data, ctx) => {
  if (!data.type) return
  const configSchema = typeConfigSchemas[data.type]
  if (!configSchema) return
  const result = configSchema.safeParse({ ...data.config, type: data.type })
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      ctx.addIssue({
        ...issue,
        path: ["config", ...issue.path],
      })
    })
  }
})

const updateChannelSchema = baseChannelSchema.partial().omit({ agentId: true })

export const channelRouter = router({
  list: protectedProcedure
    .input(z.object({ agentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [agent] = await ctx.db
        .select()
        .from(agents)
        .where(eq(agents.id, input.agentId))
        .limit(1)

      if (!agent || agent.workspaceId !== ctx.workspaceId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" })
      }

      return ctx.db
        .select()
        .from(channels)
        .where(eq(channels.agentId, input.agentId))
        .orderBy(channels.createdAt)
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [channel] = await ctx.db
        .select()
        .from(channels)
        .where(eq(channels.id, input.id))
        .limit(1)

      if (!channel) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const [agent] = await ctx.db
        .select({ workspaceId: agents.workspaceId })
        .from(agents)
        .where(eq(agents.id, channel.agentId))
        .limit(1)

      if (!agent || agent.workspaceId !== ctx.workspaceId) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      return channel
    }),

  create: protectedProcedure.input(insertChannelSchema).mutation(async ({ ctx, input }) => {
    const [agent] = await ctx.db
      .select({ workspaceId: agents.workspaceId })
      .from(agents)
      .where(eq(agents.id, input.agentId))
      .limit(1)

    if (!agent || agent.workspaceId !== ctx.workspaceId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" })
    }

    const [channel] = await ctx.db
      .insert(channels)
      .values({
        ...input,
        isActive: input.isActive ?? "true",
        config: input.config ?? {},
      })
      .returning()

    if (!channel) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
    }
    return channel
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateChannelSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(channels)
        .where(eq(channels.id, input.id))
        .limit(1)

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const [agent] = await ctx.db
        .select({ workspaceId: agents.workspaceId })
        .from(agents)
        .where(eq(agents.id, existing.agentId))
        .limit(1)

      if (!agent || agent.workspaceId !== ctx.workspaceId) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      const [channel] = await ctx.db
        .update(channels)
        .set(input.data)
        .where(eq(channels.id, input.id))
        .returning()

      return channel
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(channels)
        .where(eq(channels.id, input.id))
        .limit(1)

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const [agent] = await ctx.db
        .select({ workspaceId: agents.workspaceId })
        .from(agents)
        .where(eq(agents.id, existing.agentId))
        .limit(1)

      if (!agent || agent.workspaceId !== ctx.workspaceId) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      await ctx.db.delete(channels).where(eq(channels.id, input.id))
      return { success: true }
    }),

  testConnection: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [channel] = await ctx.db
        .select()
        .from(channels)
        .where(eq(channels.id, input.id))
        .limit(1)

      if (!channel) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const [agent] = await ctx.db
        .select({ workspaceId: agents.workspaceId })
        .from(agents)
        .where(eq(agents.id, channel.agentId))
        .limit(1)

      if (!agent || agent.workspaceId !== ctx.workspaceId) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      try {
        const { getChannelProvider } = await import("@chaste-ai/channels")
        const provider = getChannelProvider(channel.type)
        return await provider.testConnection(channel.config as Record<string, unknown>)
      } catch {
        return { success: false as const, message: "Provider not available" }
      }
    }),

  testProviderConfig: protectedProcedure
    .input(
      z.object({
        type: z.enum(channelTypes),
        config: z.record(z.unknown()),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const { getChannelProvider } = await import("@chaste-ai/channels")
        const provider = getChannelProvider(input.type)
        return await provider.testConnection(input.config)
      } catch {
        return { success: false as const, message: "Provider not available" }
      }
    }),
})
