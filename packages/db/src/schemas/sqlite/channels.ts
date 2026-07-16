import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { id, timestampNow, jsonText } from "./helpers"

export const channelTypes = [
  "web",
  "widget",
  "api",
  "slack",
  "discord",
  "whatsapp",
  "telegram",
] as const
export type ChannelType = (typeof channelTypes)[number]

export const channels = sqliteTable("channels", {
  id: id(),
  agentId: text("agent_id").notNull(),
  type: text("type").notNull().$type<ChannelType>().default("widget"),
  name: text("name").notNull(),
  config: jsonText<Record<string, unknown>>("config").default({}),
  isActive: text("is_active").notNull().default("true"),
  createdAt: timestampNow("created_at"),
  updatedAt: timestampNow("updated_at"),
})
