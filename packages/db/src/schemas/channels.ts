import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core"

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

export const channels = pgTable("channels", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull(),
  type: text("type").notNull().$type<ChannelType>().default("widget"),
  name: text("name").notNull(),
  config: jsonb("config").$type<Record<string, unknown>>().default({}),
  isActive: text("is_active").notNull().default("true"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
