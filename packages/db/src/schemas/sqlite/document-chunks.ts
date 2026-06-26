import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { id, timestampNow, jsonText } from "./helpers"

export const documentChunks = sqliteTable("document_chunks", {
  id: id(),
  documentId: text("document_id").notNull(),
  content: text("content").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  embedding: text("embedding"),
  metadata: jsonText<Record<string, unknown>>("metadata").default({}),
  createdAt: timestampNow("created_at"),
})
