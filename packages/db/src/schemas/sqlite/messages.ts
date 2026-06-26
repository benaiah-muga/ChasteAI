import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { id, timestampNow, jsonText } from "./helpers"

export const messageRoles = ["user", "assistant", "system", "tool"] as const
export type MessageRole = (typeof messageRoles)[number]

export const messages = sqliteTable("messages", {
  id: id(),
  conversationId: text("conversation_id").notNull(),
  role: text("role").notNull().$type<MessageRole>(),
  content: text("content").notNull(),
  toolCalls: jsonText<Record<string, unknown>[]>("tool_calls"),
  toolResults: jsonText<Record<string, unknown>[]>("tool_results"),
  tokensIn: integer("tokens_in"),
  tokensOut: integer("tokens_out"),
  createdAt: timestampNow("created_at"),
})
