import { NextRequest } from "next/server"
import { getDatabaseClient } from "@chaste-ai/db"
import { eq, and } from "drizzle-orm"
import { z } from "zod"
import { documents, documentChunks, memberships } from "@chaste-ai/db"
import { createProvider, chunkText } from "@chaste-ai/ai"
import { auth } from "@/auth"

export const runtime = "nodejs"

const ingestBodySchema = z.object({
  documentId: z.string().uuid(),
  content: z.string().min(1),
})

export async function POST(req: NextRequest, _props: { params: Promise<Record<string, string>> }) {
  const session = await auth()

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  let body: z.infer<typeof ingestBodySchema>
  try {
    body = ingestBodySchema.parse(await req.json())
  } catch {
    return new Response("Invalid JSON", { status: 400 })
  }

  const db = getDatabaseClient()

  const [doc] = await db.select().from(documents).where(eq(documents.id, body.documentId)).limit(1)

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

  try {
    const chunks = chunkText(body.content, { maxChunkSize: 1000, overlap: 200 })

    const provider = createProvider({
      type: "openai",
      model: "gpt-4o",
      apiKey: process.env.OPENAI_API_KEY,
    })

    const chunkRecords: (typeof documentChunks.$inferInsert)[] = []

    for (const chunk of chunks) {
      let embedding: number[] | null = null

      try {
        const embeddings = await provider.embeddings({
          model: "text-embedding-3-small",
          input: chunk.content,
        })
        embedding = embeddings[0]?.embedding ?? null
      } catch {
        // embeddings optional — proceed without
      }

      chunkRecords.push({
        documentId: body.documentId,
        content: chunk.content,
        chunkIndex: chunk.index,
        embedding: embedding ? JSON.stringify(embedding) : null,
        metadata: { charCount: chunk.content.length },
      })
    }

    await db.transaction(async (tx) => {
      if (chunkRecords.length > 0) {
        await tx.insert(documentChunks).values(chunkRecords)
      }
      await tx.update(documents).set({ status: "ready" }).where(eq(documents.id, body.documentId))
    })

    return new Response(JSON.stringify({ success: true, chunkCount: chunkRecords.length }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    await db
      .update(documents)
      .set({
        status: "failed",
        errorMessage: (error as Error).message,
      })
      .where(eq(documents.id, body.documentId))

    return new Response(JSON.stringify({ error: "Ingestion failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
