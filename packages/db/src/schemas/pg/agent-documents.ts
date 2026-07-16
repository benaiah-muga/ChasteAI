import { pgTable, uuid, timestamp, uniqueIndex } from "drizzle-orm/pg-core"

export const agentDocuments = pgTable(
  "agent_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agentId: uuid("agent_id").notNull(),
    documentId: uuid("document_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    agentDocumentUnique: uniqueIndex("agent_documents_agent_document_unique").on(
      table.agentId,
      table.documentId,
    ),
  }),
)
