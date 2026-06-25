import { eq, inArray } from "drizzle-orm"
import { documents, documentChunks, type DatabaseClient } from "@chaste-ai/db"
import { createProvider } from "@chaste-ai/ai"

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0
  let normA = 0
  let normB = 0
  const len = Math.min(a.length, b.length)
  for (let i = 0; i < len; i++) {
    const ai = a[i]!
    const bi = b[i]!
    dot += ai * bi
    normA += ai * ai
    normB += bi * bi
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}

function parseEmbedding(raw: string | null): number[] | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every((n) => typeof n === "number")) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export interface RetrievedChunk {
  id: string
  documentId: string
  content: string
  chunkIndex: number
  similarity: number
  metadata: Record<string, unknown> | null
}

export interface RetrievalOptions {
  maxChunks?: number
  minSimilarity?: number
  providerConfig?: {
    apiKey?: string
    model?: string
  }
}

export async function retrieveRelevantChunks(
  db: DatabaseClient,
  workspaceId: string,
  query: string,
  options: RetrievalOptions = {},
): Promise<RetrievedChunk[]> {
  const { maxChunks = 3, minSimilarity = 0.0 } = options

  const workspaceDocs = await db
    .select({ id: documents.id })
    .from(documents)
    .where(eq(documents.workspaceId, workspaceId))

  if (workspaceDocs.length === 0) return []

  const docIds = workspaceDocs.map((d) => d.id)

  const chunks = await db
    .select()
    .from(documentChunks)
    .where(inArray(documentChunks.documentId, docIds))

  if (chunks.length === 0) return []

  const provider = createProvider({
    type: "openai",
    apiKey: options.providerConfig?.apiKey ?? process.env.OPENAI_API_KEY,
    model: options.providerConfig?.model ?? "gpt-4o",
  })

  let queryEmbedding: number[] | null = null
  try {
    const embeddings = await provider.embeddings({
      model: "text-embedding-3-small",
      input: query,
    })
    queryEmbedding = embeddings[0]?.embedding ?? null
  } catch {
    return []
  }

  if (!queryEmbedding) return []

  const scored: RetrievedChunk[] = []

  for (const chunk of chunks) {
    const embedding = parseEmbedding(chunk.embedding)
    if (!embedding) continue

    const similarity = cosineSimilarity(queryEmbedding, embedding)
    if (similarity < minSimilarity) continue

    scored.push({
      id: chunk.id,
      documentId: chunk.documentId,
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      similarity,
      metadata: chunk.metadata,
    })
  }

  scored.sort((a, b) => b.similarity - a.similarity)
  return scored.slice(0, maxChunks)
}

export function buildContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return ""

  const sections = chunks.map(
    (chunk, i) => `[${i + 1}] ${chunk.content}`,
  )

  return [
    "Here is relevant information from the knowledge base to help answer the user's question:",
    "",
    ...sections,
    "",
    "Use this information to provide an accurate answer. If the information doesn't help answer the question, rely on your own knowledge.",
  ].join("\n")
}
