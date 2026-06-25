import { NextRequest } from "next/server"
import { getDatabaseClient } from "@chaste-ai/db"
import { eq } from "drizzle-orm"
import { channels, conversations } from "@chaste-ai/db"

export const runtime = "nodejs"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> },
) {
  const { channelId } = await params
  const db = getDatabaseClient()

  const [channel] = await db
    .select()
    .from(channels)
    .where(eq(channels.id, channelId))
    .limit(1)

  if (!channel || channel.isActive !== "true") {
    return Response.json({ error: "Channel not found or inactive" }, { status: 404 })
  }

  const conversation = await db
    .insert(conversations)
    .values({
      channelId: channel.id,
      externalUserId: `anon-${crypto.randomUUID().slice(0, 8)}`,
    })
    .returning()

  return Response.json({ conversation: conversation[0] })
}
