import { NextRequest } from "next/server"
import { getDatabaseClient } from "@chaste-ai/db"
import { eq, and } from "drizzle-orm"
import { conversations, messages, channels, agents, memberships } from "@chaste-ai/db"
import { createProvider } from "@chaste-ai/ai"
import { retrieveRelevantChunks, buildContext } from "@chaste-ai/rag"
import { auth } from "@/auth"

export const runtime = "nodejs"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params
  const session = await auth()

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const db = getDatabaseClient()

  const body = await req.json()
  const content = body?.content as string | undefined

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return new Response("Content is required", { status: 400 })
  }

  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1)

  if (!conversation) {
    return new Response("Conversation not found", { status: 404 })
  }

  const [channel] = await db
    .select()
    .from(channels)
    .where(eq(channels.id, conversation.channelId))
    .limit(1)

  if (!channel) {
    return new Response("Channel not found", { status: 404 })
  }

  const [agent] = await db.select().from(agents).where(eq(agents.id, channel.agentId)).limit(1)

  if (!agent) {
    return new Response("Agent not found", { status: 404 })
  }

  const [membership] = await db
    .select()
    .from(memberships)
    .where(
      and(eq(memberships.workspaceId, agent.workspaceId), eq(memberships.userId, session.user.id)),
    )
    .limit(1)

  if (!membership) {
    return new Response("Forbidden", { status: 403 })
  }

  const model = (agent.providerConfig?.model as string) ?? "gpt-4o"

  const provider = createProvider({
    type: (agent.providerConfig?.provider as string) ?? "openai",
    apiKey: (agent.providerConfig?.apiKey as string) ?? process.env.OPENAI_API_KEY,
    model,
  })

  const agentConfig = agent.providerConfig as Record<string, unknown> | null
  let ragContext = ""
  if (agentConfig?.ragEnabled === true) {
    try {
      const ragOpts = { maxChunks: (agentConfig?.ragMaxChunks as number) ?? 3 }
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
