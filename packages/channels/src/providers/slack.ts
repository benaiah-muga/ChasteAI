import type { ChannelProvider, ChannelRecord, OutboundResult, ConnectionTestResult } from "../types"

let connections = new Map<string, { botToken: string }>()

export const slackProvider: ChannelProvider = {
  type: "slack",

  async initialize(channel: ChannelRecord) {
    const config = channel.config as { botToken?: string }
    if (!config.botToken) throw new Error("Slack bot token not configured")
    connections.set(channel.id, { botToken: config.botToken })
  },

  async sendMessage(
    _channel: ChannelRecord,
    externalUserId: string,
    content: string,
  ): Promise<OutboundResult> {
    const conn = connections.get(_channel.id)
    if (!conn) return { success: false }
    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${conn.botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ channel: externalUserId, text: content }),
    })
    const data = await res.json()
    return {
      success: data.ok === true,
      platformMessageId: data.ts,
    }
  },

  async testConnection(config: Record<string, unknown>): Promise<ConnectionTestResult> {
    const botToken = config.botToken as string | undefined
    if (!botToken) return { success: false, message: "No bot token provided" }
    try {
      const res = await fetch("https://slack.com/api/auth.test", {
        headers: { Authorization: `Bearer ${botToken}` },
      })
      const data = await res.json()
      return data.ok === true
        ? { success: true }
        : { success: false, message: data.error ?? "Invalid Slack credentials" }
    } catch {
      return { success: false, message: "Failed to reach Slack API" }
    }
  },

  async shutdown(channel: ChannelRecord) {
    connections.delete(channel.id)
  },
}
