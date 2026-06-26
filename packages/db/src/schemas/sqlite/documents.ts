import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { id, timestampNow, jsonText } from "./helpers"

export const documentSources = ["website", "pdf", "docx", "markdown", "api", "notion", "github"] as const
export type DocumentSource = (typeof documentSources)[number]

export const documentStatuses = ["pending", "processing", "ready", "failed"] as const
export type DocumentStatus = (typeof documentStatuses)[number]

export const documents = sqliteTable("documents", {
  id: id(),
  workspaceId: text("workspace_id").notNull(),
  sourceType: text("source_type").notNull().$type<DocumentSource>(),
  sourceUrl: text("source_url"),
  title: text("title"),
  status: text("status").notNull().$type<DocumentStatus>().default("pending"),
  errorMessage: text("error_message"),
  metadata: jsonText<Record<string, unknown>>("metadata").default({}),
  createdAt: timestampNow("created_at"),
  updatedAt: timestampNow("updated_at"),
})
