import { NextRequest } from "next/server"
import { getDatabaseClient } from "@chaste-ai/db"
import { eq } from "drizzle-orm"
import { conversations, messages, channels, agents } from "@chaste-ai/db"
import { createProvider } from "@chaste-ai/ai"
import { retrieveRelevantChunks, buildContext } from "@chaste-ai/rag"

export const runtime = "nodejs"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ channelId: string; conversationId: string }> },
) {
  const { channelId, conversationId } = await params
  const db = getDatabaseClient()

  const [channel] = await db.select().from(channels).where(eq(channels.id, channelId)).limit(1)

  if (!channel || channel.isActive !== "true") {
    return new Response("Channel not found or inactive", { status: 404 })
  }

  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1)

  if (!conversation || conversation.channelId !== channelId) {
    return new Response("Conversation not found", { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return new Response("Invalid JSON body", { status: 400 })
  }
  const content = body?.content as string | undefined

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return new Response("Content is required", { status: 400 })
  }

  const [agent] = await db.select().from(agents).where(eq(agents.id, channel.agentId)).limit(1)

  if (!agent) {
    return new Response("Agent not found", { status: 404 })
  }

  const provider = createProvider({
    type: (agent.providerConfig?.provider as string) ?? "openai",
    apiKey:
      (agent.providerConfig?.apiKey as string) ??
      process.env.OPENAI_API_KEY ??
      process.env.GROQ_API_KEY,
    baseUrl: agent.providerConfig?.baseUrl as string | undefined,
    model: (agent.providerConfig?.model as string) ?? "gpt-4o",
  })

  const model = (agent.providerConfig?.model as string) ?? "gpt-4o"

  const agentConfig = agent.providerConfig as Record<string, unknown> | null
  let ragContext = ""
  if (agentConfig?.ragEnabled === true) {
    try {
      const ragOpts = { maxChunks: (agentConfig?.ragMaxChunks as number) ?? 3, agentId: agent.id }
      const chunks = await retrieveRelevantChunks(db, agent.workspaceId, content.trim(), ragOpts)
      ragContext = buildContext(chunks)
    } catch {
      // RAG error — proceed without context
    }
  }

  const [insertedUser] = await db
    .insert(messages)
    .values({
      conversationId,
      role: "user",
      content: content.trim(),
    })
    .returning()

  const userMessageId = insertedUser?.id ?? null

  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt)

  const systemMessages: { role: "system"; content: string }[] = []
  if (agent.systemPrompt) {
    systemMessages.push({ role: "system", content: agent.systemPrompt })
  }
  if (ragContext) {
    systemMessages.push({ role: "system", content: ragContext })
  }

  const chatMessages = [
    ...systemMessages,
    ...history.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    })),
  ]

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let fullContent = ""

      try {
        const response = await provider.chatStream({
          model,
          messages: chatMessages,
          stream: true,
        })

        for await (const chunk of response) {
          fullContent += chunk.content
          const data = JSON.stringify({ token: chunk.content })
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        }

        const [assistantMessage] = await db
          .insert(messages)
          .values({
            conversationId,
            role: "assistant",
            content: fullContent,
          })
          .returning()

        await db
          .update(conversations)
          .set({
            messageCount: history.length + 1,
            status: "active",
            updatedAt: new Date(),
          })
          .where(eq(conversations.id, conversationId))

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ done: true, messageId: assistantMessage?.id })}\n\n`,
          ),
        )
      } catch (error) {
        if (userMessageId) {
          await db
            .delete(messages)
            .where(eq(messages.id, userMessageId))
            .catch(() => {})
        }
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: "AI provider error" })}\n\n`),
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
