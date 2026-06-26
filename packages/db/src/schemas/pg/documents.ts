import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core"

export const documentSources = ["website", "pdf", "docx", "markdown", "api", "notion", "github"] as const
export type DocumentSource = (typeof documentSources)[number]

export const documentStatuses = ["pending", "processing", "ready", "failed"] as const
export type DocumentStatus = (typeof documentStatuses)[number]

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull(),
  sourceType: text("source_type").notNull().$type<DocumentSource>(),
  sourceUrl: text("source_url"),
  title: text("title"),
  status: text("status").notNull().$type<DocumentStatus>().default("pending"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
