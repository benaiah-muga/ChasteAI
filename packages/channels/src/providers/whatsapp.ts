import type { ChannelProvider, ChannelRecord, OutboundResult, ConnectionTestResult } from "../types"

let connections = new Map<string, { phoneNumber?: string }>()
let qrCodes = new Map<string, string>()

export const whatsappProvider: ChannelProvider = {
  type: "whatsapp",

  async initialize(channel: ChannelRecord) {
    const config = channel.config as { phoneNumber?: string }
    connections.set(channel.id, { phoneNumber: config.phoneNumber })
  },

  async sendMessage(
    _channel: ChannelRecord,
    _externalUserId: string,
    _content: string,
  ): Promise<OutboundResult> {
    return { success: false }
  },

  async testConnection(_config: Record<string, unknown>): Promise<ConnectionTestResult> {
    return { success: true, message: "WhatsApp (Baileys) requires QR code pairing to connect" }
  },

  async shutdown(channel: ChannelRecord) {
    connections.delete(channel.id)
    qrCodes.delete(channel.id)
  },

  async getQRCode(channelId: string): Promise<string | null> {
    return qrCodes.get(channelId) ?? null
  },
}
