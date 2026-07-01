import type { ChannelProvider, ChannelRecord, OutboundResult, ConnectionTestResult } from "../types"

const DISCORD_API = "https://discord.com/api/v10"

let connections = new Map<string, { botToken: string }>()

async function createDM(botToken: string, userId: string): Promise<string | null> {
  const res = await fetch(`${DISCORD_API}/users/@me/channels`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recipient_id: userId }),
  })
  const data = await res.json()
  return data.id ?? null
}

export const discordProvider: ChannelProvider = {
  type: "discord",

  async initialize(channel: ChannelRecord) {
    const config = channel.config as { botToken?: string }
    if (!config.botToken) throw new Error("Discord bot token not configured")
    connections.set(channel.id, { botToken: config.botToken })
  },

  async sendMessage(
    _channel: ChannelRecord,
    externalUserId: string,
    content: string,
  ): Promise<OutboundResult> {
    const conn = connections.get(_channel.id)
    if (!conn) return { success: false }

    const channelId = await createDM(conn.botToken, externalUserId)
    if (!channelId) return { success: false }

    const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${conn.botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    })
    const data = await res.json()
    return {
      success: !!data.id,
      platformMessageId: data.id,
    }
  },

  async testConnection(config: Record<string, unknown>): Promise<ConnectionTestResult> {
    const botToken = config.botToken as string | undefined
    if (!botToken) return { success: false, message: "No bot token provided" }
    try {
      const res = await fetch(`${DISCORD_API}/users/@me`, {
        headers: { Authorization: `Bot ${botToken}` },
      })
      const data = await res.json()
      return data.id
        ? { success: true }
        : { success: false, message: data.message ?? "Invalid Discord token" }
    } catch {
      return { success: false, message: "Failed to reach Discord API" }
    }
  },

  async shutdown(channel: ChannelRecord) {
    connections.delete(channel.id)
  },
}
