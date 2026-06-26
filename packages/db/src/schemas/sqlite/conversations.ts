import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { id, timestampNow, jsonText } from "./helpers"

export const conversationStatuses = ["active", "waiting", "resolved", "closed"] as const
export type ConversationStatus = (typeof conversationStatuses)[number]

export const conversations = sqliteTable("conversations", {
  id: id(),
  channelId: text("channel_id").notNull(),
  externalUserId: text("external_user_id"),
  status: text("status").notNull().$type<ConversationStatus>().default("active"),
  metadata: jsonText<Record<string, unknown>>("metadata").default({}),
  messageCount: integer("message_count").notNull().default(0),
  createdAt: timestampNow("created_at"),
  updatedAt: timestampNow("updated_at"),
})
