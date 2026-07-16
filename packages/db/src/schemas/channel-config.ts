import { z } from "zod"

export const telegramConfigSchema = z.object({
  botToken: z.string().min(1, "Bot token is required"),
})

export const slackConfigSchema = z.object({
  botToken: z.string().min(1, "Bot token is required"),
  appToken: z.string().min(1, "App-level token is required"),
  signingSecret: z.string().min(1, "Signing secret is required"),
})

export const discordConfigSchema = z.object({
  botToken: z.string().min(1, "Bot token is required"),
  applicationId: z.string().min(1, "Application ID is required"),
  publicKey: z.string().min(1, "Public key is required"),
})

export const whatsappConfigSchema = z.object({
  phoneNumber: z.string().optional(),
})

export const widgetConfigSchema = z.object({
  color: z.string().optional(),
  title: z.string().optional(),
  greeting: z.string().optional(),
  agentName: z.string().optional(),
})

export const webConfigSchema = z.object({})

export const apiConfigSchema = z.object({})

export const channelConfigSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("telegram"), ...telegramConfigSchema.shape }),
  z.object({ type: z.literal("slack"), ...slackConfigSchema.shape }),
  z.object({ type: z.literal("discord"), ...discordConfigSchema.shape }),
  z.object({ type: z.literal("whatsapp"), ...whatsappConfigSchema.shape }),
  z.object({ type: z.literal("widget"), ...widgetConfigSchema.shape }),
  z.object({ type: z.literal("web"), ...webConfigSchema.shape }),
  z.object({ type: z.literal("api"), ...apiConfigSchema.shape }),
])

export type TelegramConfig = z.infer<typeof telegramConfigSchema>
export type SlackConfig = z.infer<typeof slackConfigSchema>
export type DiscordConfig = z.infer<typeof discordConfigSchema>
export type WhatsAppConfig = z.infer<typeof whatsappConfigSchema>
export type WidgetConfig = z.infer<typeof widgetConfigSchema>
export type WebConfig = z.infer<typeof webConfigSchema>
export type ApiConfig = z.infer<typeof apiConfigSchema>

export type ChannelConfig = z.infer<typeof channelConfigSchema>
