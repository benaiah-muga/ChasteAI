import { NextRequest } from "next/server"
import { getDatabaseClient } from "@chaste-ai/db"
import { eq, and } from "drizzle-orm"
import { conversations, messages, channels, agents, memberships } from "@chaste-ai/db"
import { createProvider, checkContentSafety } from "@chaste-ai/ai"
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

  const agentConfig = agent.providerConfig as Record<string, unknown> | null
  const contentSafetyConfig = agentConfig?.contentSafety as Record<string, unknown> | null

  if (contentSafetyConfig?.enabled && contentSafetyConfig?.checkInput) {
    try {
      const safetyResult = await checkContentSafety(content.trim(), null, {
        enabled: true,
        checkInput: true,
        checkResponse: false,
        apiKey: (contentSafetyConfig.apiKey as string) ?? (agentConfig?.apiKey as string),
        baseUrl: contentSafetyConfig.baseUrl as string | undefined,
        model: contentSafetyConfig.model as string | undefined,
      })

      if (!safetyResult.inputSafe) {
        return new Response(
          JSON.stringify({
            error: "Message blocked by content safety policy",
            categories: safetyResult.categories,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        )
      }
    } catch {
      // Safety check failed — proceed without blocking
    }
  }

  const model = (agentConfig?.model as string) ?? "gpt-4o"

  const provider = createProvider({
    type: (agentConfig?.provider as string) ?? "openai",
    apiKey:
      (agentConfig?.apiKey as string) ?? process.env.OPENAI_API_KEY ?? process.env.GROQ_API_KEY,
    baseUrl: agentConfig?.baseUrl as string | undefined,
    model,
  })

  let ragContext = ""
  if (agentConfig?.ragEnabled === true) {
    try {
      const embedding = agentConfig?.embedding as Record<string, unknown> | undefined
      const ragOpts = {
        maxChunks: (agentConfig?.ragMaxChunks as number) ?? 3,
        agentId: agent.id,
        embeddingConfig: embedding
          ? {
              model: embedding.model as string | undefined,
              baseUrl: embedding.baseUrl as string | undefined,
              apiKey: embedding.apiKey as string | undefined,
              dimensions: embedding.dimensions as number | undefined,
            }
          : undefined,
      }
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
        const parameters = agentConfig?.parameters as Record<string, unknown> | undefined
        const response = await provider.chatStream({
          model,
          messages: chatMessages,
          stream: true,
          temperature: parameters?.temperature as number | undefined,
          maxTokens: parameters?.maxTokens as number | undefined,
          topP: parameters?.topP as number | undefined,
        })

        for await (const chunk of response) {
          fullContent += chunk.content
          const data = JSON.stringify({ token: chunk.content })
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        }

        if (contentSafetyConfig?.enabled && contentSafetyConfig?.checkResponse) {
          try {
            const safetyResult = await checkContentSafety(content.trim(), fullContent, {
              enabled: true,
              checkInput: false,
              checkResponse: true,
              apiKey: (contentSafetyConfig.apiKey as string) ?? (agentConfig?.apiKey as string),
              baseUrl: contentSafetyConfig.baseUrl as string | undefined,
              model: contentSafetyConfig.model as string | undefined,
            })

            if (!safetyResult.responseSafe) {
              fullContent =
                "I apologize, but I cannot provide a response to that query. Please rephrase your question or ask something else."
            }
          } catch {
            // Safety check failed — proceed with original response
          }
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
