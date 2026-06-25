import { pgTable, uuid, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core"

export const conversationStatuses = ["active", "waiting", "resolved", "closed"] as const
export type ConversationStatus = (typeof conversationStatuses)[number]

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  channelId: uuid("channel_id").notNull(),
  externalUserId: text("external_user_id"),
  status: text("status").notNull().$type<ConversationStatus>().default("active"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  messageCount: integer("message_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
