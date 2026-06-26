import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { id, timestampNow, jsonText } from "./helpers"

export const agentStatuses = ["active", "inactive", "draft"] as const
export type AgentStatus = (typeof agentStatuses)[number]

export const agents = sqliteTable("agents", {
  id: id(),
  workspaceId: text("workspace_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  systemPrompt: text("system_prompt"),
  status: text("status").notNull().$type<AgentStatus>().default("draft"),
  providerConfig: jsonText<Record<string, unknown>>("provider_config").notNull(),
  createdAt: timestampNow("created_at"),
  updatedAt: timestampNow("updated_at"),
})
