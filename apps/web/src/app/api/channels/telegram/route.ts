import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { channels, conversations, messages, agents } from "@chaste-ai/db"
import { getDatabaseClient } from "@chaste-ai/db"
import { createProvider, ProviderConfigSchema } from "@chaste-ai/ai"

export async function POST(request: Request) {
  const db = getDatabaseClient()

  try {
    const update = await request.json()

    if (!update.message?.text || !update.message?.chat?.id) {
      return NextResponse.json({ ok: true })
    }

    const chatId = update.message.chat.id.toString()
    const text = update.message.text

    const allChannels = await db.select().from(channels).where(eq(channels.type, "telegram"))
    if (allChannels.length === 0) {
      return NextResponse.json({ ok: true })
    }

    for (const channel of allChannels) {
      if (channel.isActive !== "true") continue

      const [agent] = await db.select().from(agents).where(eq(agents.id, channel.agentId)).limit(1)
      if (!agent) continue

      let [conversation] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.externalUserId, chatId))
        .limit(1)

      if (!conversation) {
        ;[conversation] = await db
          .insert(conversations)
          .values({ channelId: channel.id, externalUserId: chatId })
          .returning()
      }

      const conv = conversation!
      const convId = conv.id

      await db.insert(messages).values({
        conversationId: convId,
        role: "user",
        content: text,
      })

      await db
        .update(conversations)
        .set({ messageCount: (conv.messageCount ?? 0) + 1, updatedAt: new Date() })
        .where(eq(conversations.id, convId))

      try {
        const providerConfig = ProviderConfigSchema.parse(agent.providerConfig)
        const provider = createProvider(providerConfig)
        const result = await provider.chat({
          model: providerConfig.model,
          messages: [{ role: "user", content: text }],
          systemPrompt: agent.systemPrompt ?? undefined,
          stream: false,
        })

        const reply = result.message.content

        await db.insert(messages).values({
          conversationId: convId,
          role: "assistant",
          content: reply,
        })

        const config = channel.config as { botToken?: string }
        if (config.botToken) {
          await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: Number(chatId), text: reply }),
          })
        }
      } catch {
        // AI error — silently fail; message already saved
      }

      break
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
