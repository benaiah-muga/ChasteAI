-- pgvector extension for similarity search
CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint

-- Migrate embedding column from text to vector(1024)
-- 1024 dimensions = nomic-embed-text output size
ALTER TABLE document_chunks
  ALTER COLUMN embedding TYPE vector(1024)
  USING CASE
    WHEN embedding IS NULL THEN NULL
    WHEN embedding = '' THEN NULL
    ELSE embedding::vector(1024)
  END;
--> statement-breakpoint

-- HNSW index for fast approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
  ON document_chunks
  USING hnsw (embedding vector_cosine_ops);
