import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core"

export const agentStatuses = ["active", "inactive", "draft"] as const
export type AgentStatus = (typeof agentStatuses)[number]

export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  systemPrompt: text("system_prompt"),
  status: text("status").notNull().$type<AgentStatus>().default("draft"),
  providerConfig: jsonb("provider_config").notNull().$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
