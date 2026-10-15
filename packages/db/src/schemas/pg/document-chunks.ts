import { pgTable, uuid, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core"

export const documentChunks = pgTable("document_chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").notNull(),
  content: text("content").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  // pgvector: text for dev, vector(1024) in production via migration 0009
  embedding: text("embedding"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})
