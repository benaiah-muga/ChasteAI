export type ChannelRecord = {
  id: string
  agentId: string
  type: string
  name: string
  config: Record<string, unknown>
  isActive: string
}

export type InboundMessage = {
  channelId: string
  externalUserId: string
  content: string
  platformMessageId?: string
}

export type OutboundResult = {
  success: boolean
  platformMessageId?: string
}

export type ConnectionTestResult = {
  success: boolean
  message?: string
}

export interface ChannelProvider {
  readonly type: string
  initialize(channel: ChannelRecord): Promise<void>
  sendMessage(
    channel: ChannelRecord,
    externalUserId: string,
    content: string,
  ): Promise<OutboundResult>
  testConnection(config: Record<string, unknown>): Promise<ConnectionTestResult>
  shutdown(channel: ChannelRecord): Promise<void>
  getQRCode?(channelId: string): Promise<string | null>
}
