import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import { id, timestampNow } from "./helpers"

export const agentDocuments = sqliteTable(
  "agent_documents",
  {
    id: id(),
    agentId: text("agent_id").notNull(),
    documentId: text("document_id").notNull(),
    createdAt: timestampNow("created_at"),
  },
  (table) => ({
    agentDocumentUnique: uniqueIndex("agent_documents_agent_document_unique").on(
      table.agentId,
      table.documentId,
    ),
  }),
)
