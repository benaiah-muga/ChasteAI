import { describe, it, expect, beforeAll } from "vitest"
import OpenAI from "openai"

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1"
const EMBEDDING_MODEL = "nomic-embed-text"
const DIMENSIONS = 1024

describe("Ollama Local Embeddings Integration", () => {
  let client: OpenAI

  beforeAll(() => {
    client = new OpenAI({
      apiKey: "ollama",
      baseURL: OLLAMA_BASE_URL,
    })
  })

  it("should generate a single embedding", async () => {
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: "What is ChasteAI?",
    })

    expect(response.data[0]?.embedding).toBeDefined()
    expect(response.data[0]?.embedding?.length).toBe(DIMENSIONS)
    expect(response.data[0]?.embedding?.every((n) => typeof n === "number")).toBe(true)
  })

  it("should generate batch embeddings", async () => {
    const texts = [
      "Customer support ticket about billing",
      "How to reset my password",
      "Product pricing and plans",
    ]

    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts,
    })

    expect(response.data.length).toBe(3)
    response.data.forEach((item) => {
      expect(item.embedding?.length).toBe(DIMENSIONS)
    })
  })

  it("should compute meaningful cosine similarity", async () => {
    const texts = [
      "business hours and availability",
      "our hours are 9am to 6pm weekdays",
      "best restaurants in downtown",
    ]

    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts,
    })

    const queryEmb = response.data[0]?.embedding ?? []
    const doc1Emb = response.data[1]?.embedding ?? []
    const doc2Emb = response.data[2]?.embedding ?? []

    function cosine(a: number[], b: number[]): number {
      let dot = 0,
        nA = 0,
        nB = 0
      for (let i = 0; i < a.length; i++) {
        dot += a[i]! * b[i]!
        nA += a[i]! * a[i]!
        nB += b[i]! * b[i]!
      }
      return dot / (Math.sqrt(nA) * Math.sqrt(nB))
    }

    const sim1 = cosine(queryEmb, doc1Emb)
    const sim2 = cosine(queryEmb, doc2Emb)

    expect(sim1).toBeGreaterThan(sim2)
    expect(sim1).toBeGreaterThan(0.5)
  })

  it("should store and retrieve embeddings from PostgreSQL pgvector", async () => {
    let Pool: typeof import("pg").Pool
    try {
      const pg = await import("pg")
      Pool = pg.Pool
    } catch {
      console.log("pg package not available, skipping DB storage test")
      return
    }

    const pool = new Pool({
      connectionString:
        process.env.DATABASE_URL ?? "postgres://postgres:password@localhost:5432/chasteai",
    })

    try {
      const extCheck = await pool.query("SELECT * FROM pg_extension WHERE extname = 'vector'")

      if (extCheck.rows.length === 0) {
        console.log("pgvector not installed, skipping DB storage test")
        return
      }

      const response = await client.embeddings.create({
        model: EMBEDDING_MODEL,
        input: "Test embedding for pgvector storage",
      })

      const embedding = response.data[0]?.embedding
      expect(embedding).toBeDefined()
      expect(embedding?.length).toBe(DIMENSIONS)

      const embeddingStr = JSON.stringify(embedding)

      await pool.query(
        "INSERT INTO document_chunks (document_id, content, chunk_index, embedding) VALUES ($1, $2, $3, $4::vector)",
        ["00000000-0000-0000-0000-000000000000", "Test chunk", 0, embeddingStr],
      )

      const result = await pool.query(
        "SELECT id, content, embedding::text as emb_text FROM document_chunks WHERE document_id = $1 LIMIT 1",
        ["00000000-0000-0000-0000-000000000000"],
      )

      expect(result.rows.length).toBe(1)
      const stored = result.rows[0]
      expect(stored?.content).toBe("Test chunk")

      const parsedEmb = JSON.parse(stored?.emb_text ?? "[]")
      expect(parsedEmb.length).toBe(DIMENSIONS)

      await pool.query("DELETE FROM document_chunks WHERE document_id = $1", [
        "00000000-0000-0000-0000-000000000000",
      ])
    } finally {
      await pool.end()
    }
  })
})
