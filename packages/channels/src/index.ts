import { channelRegistry } from "./registry"
import type { ChannelProvider, ConnectionTestResult } from "./types"

export function registerProvider(provider: ChannelProvider) {
  channelRegistry.register(provider)
}

export function getChannelProvider(type: string): ChannelProvider {
  const provider = channelRegistry.get(type)
  if (!provider) {
    throw new Error(`No channel provider registered for type: ${type}`)
  }
  return provider
}

export async function testConnection(
  type: string,
  config: Record<string, unknown>,
): Promise<ConnectionTestResult> {
  const provider = getChannelProvider(type)
  return provider.testConnection(config)
}

export async function getQRCode(_channelId: string): Promise<string | null> {
  return null
}

export { registerAllProviders } from "./register"
export { channelRegistry } from "./registry"
export type {
  ChannelProvider,
  ChannelRecord,
  InboundMessage,
  OutboundResult,
  ConnectionTestResult,
} from "./types"
