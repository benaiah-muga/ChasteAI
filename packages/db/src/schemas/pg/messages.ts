import { pgTable, uuid, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core"

export const messageRoles = ["user", "assistant", "system", "tool"] as const
export type MessageRole = (typeof messageRoles)[number]

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").notNull(),
  role: text("role").notNull().$type<MessageRole>(),
  content: text("content").notNull(),
  toolCalls: jsonb("tool_calls").$type<Record<string, unknown>[]>(),
  toolResults: jsonb("tool_results").$type<Record<string, unknown>[]>(),
  tokensIn: integer("tokens_in"),
  tokensOut: integer("tokens_out"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})
