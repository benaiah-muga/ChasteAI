import { NextRequest } from "next/server"
import { getDatabaseClient } from "@chaste-ai/db"
import { eq, and } from "drizzle-orm"
import { z } from "zod"
import { documents, documentChunks, memberships } from "@chaste-ai/db"
import { createProvider, chunkText } from "@chaste-ai/ai"
import { crawlSite } from "@chaste-ai/rag"
import { auth } from "@/auth"

export const runtime = "nodejs"
export const maxDuration = 120

const crawlBodySchema = z.object({
  documentId: z.string().uuid(),
  sourceUrl: z.string().url(),
  maxPages: z.number().min(1).max(500).default(50),
  maxDepth: z.number().min(1).max(5).default(3),
})

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  let body: z.infer<typeof crawlBodySchema>
  try {
    body = crawlBodySchema.parse(await req.json())
  } catch {
    return new Response("Invalid request body", { status: 400 })
  }

  const db = getDatabaseClient()

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, body.documentId))
    .limit(1)

  if (!doc) {
    return new Response("Document not found", { status: 404 })
  }

  const [membership] = await db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.workspaceId, doc.workspaceId),
        eq(memberships.userId, session.user.id),
      ),
    )
    .limit(1)

  if (!membership) {
    return new Response("Forbidden", { status: 403 })
  }

  await db.update(documents).set({ status: "processing" }).where(eq(documents.id, body.documentId))

  void crawlAndIngest(db, body.documentId, body.sourceUrl, {
    maxPages: body.maxPages,
    maxDepth: body.maxDepth,
  })

  return new Response(JSON.stringify({ success: true, documentId: body.documentId }), {
    headers: { "Content-Type": "application/json" },
  })
}

async function crawlAndIngest(
  db: ReturnType<typeof getDatabaseClient>,
  documentId: string,
  sourceUrl: string,
  options: { maxPages: number; maxDepth: number },
) {
  try {
    const pages = await crawlSite(sourceUrl, {
      maxPages: options.maxPages,
      maxDepth: options.maxDepth,
    })

    const provider = createProvider({
      type: "openai-compatible",
      model: "gpt-4o",
      apiKey: process.env.OPENAI_API_KEY ?? process.env.GROQ_API_KEY,
    })

    let totalChunks = 0
    const allChunkRecords: (typeof documentChunks.$inferInsert)[] = []

    for (const page of pages) {
      const chunks = chunkText(page.content, { maxChunkSize: 1000, overlap: 200 })

      for (const chunk of chunks) {
        let embedding: number[] | null = null

        try {
          const embeddings = await provider.embeddings({
            model: "text-embedding-3-small",
            input: chunk.content,
          })
          embedding = embeddings[0]?.embedding ?? null
        } catch {
          // embeddings optional
        }

        allChunkRecords.push({
          documentId,
          content: chunk.content,
          chunkIndex: totalChunks,
          embedding: embedding ? JSON.stringify(embedding) : null,
          metadata: { url: page.url, charCount: chunk.content.length },
        })

        totalChunks++
      }
    }

    await db.transaction(async (tx) => {
      await tx.delete(documentChunks).where(eq(documentChunks.documentId, documentId))
      if (allChunkRecords.length > 0) {
        await tx.insert(documentChunks).values(allChunkRecords)
      }
      await tx
        .update(documents)
        .set({
          status: "ready",
          title: pages[0]?.title ?? sourceUrl,
          sourceUrl,
        })
        .where(eq(documents.id, documentId))
    })
  } catch (error) {
    await db
      .update(documents)
      .set({
        status: "failed",
        errorMessage: (error as Error).message,
      })
      .where(eq(documents.id, documentId))
  }
}
