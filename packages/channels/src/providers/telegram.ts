import type { ChannelProvider, ChannelRecord, OutboundResult, ConnectionTestResult } from "../types"

const TELEGRAM_API = "https://api.telegram.org"

async function getMe(botToken: string): Promise<boolean> {
  const res = await fetch(`${TELEGRAM_API}/bot${botToken}/getMe`)
  const data = await res.json()
  return data.ok === true
}

async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string,
): Promise<OutboundResult> {
  const res = await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: Number(chatId), text }),
  })
  const data = await res.json()
  return {
    success: data.ok === true,
    platformMessageId: data.result?.message_id?.toString(),
  }
}

let connections = new Map<string, { botToken: string }>()

export const telegramProvider: ChannelProvider = {
  type: "telegram",

  async initialize(channel: ChannelRecord) {
    const config = channel.config as { botToken?: string }
    if (!config.botToken) throw new Error("Telegram bot token not configured")
    connections.set(channel.id, { botToken: config.botToken })
  },

  async sendMessage(
    _channel: ChannelRecord,
    externalUserId: string,
    content: string,
  ): Promise<OutboundResult> {
    const conn = connections.get(_channel.id)
    if (!conn) return { success: false }
    return sendTelegramMessage(conn.botToken, externalUserId, content)
  },

  async testConnection(config: Record<string, unknown>): Promise<ConnectionTestResult> {
    const botToken = config.botToken as string | undefined
    if (!botToken) return { success: false, message: "No bot token provided" }
    try {
      const ok = await getMe(botToken)
      return ok ? { success: true } : { success: false, message: "Invalid bot token" }
    } catch {
      return { success: false, message: "Failed to reach Telegram API" }
    }
  },

  async shutdown(channel: ChannelRecord) {
    connections.delete(channel.id)
  },
}
