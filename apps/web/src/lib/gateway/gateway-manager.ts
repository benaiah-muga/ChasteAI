import { registerAllProviders, getChannelProvider } from "@chaste-ai/channels"
import type { ChannelRecord } from "@chaste-ai/channels"

type ManagedChannel = {
  channel: ChannelRecord
}

let managed = new Map<string, ManagedChannel>()
let started = false

export const gatewayManager = {
  async start() {
    if (started) return
    started = true
    registerAllProviders()
  },

  async connectChannel(channel: ChannelRecord) {
    if (managed.has(channel.id)) return
    try {
      const provider = getChannelProvider(channel.type)
      await provider.initialize(channel)
      managed.set(channel.id, { channel })
    } catch {
      // Connection failures are expected (e.g., no credentials yet)
    }
  },

  async disconnectChannel(channelId: string) {
    const entry = managed.get(channelId)
    if (!entry) return
    try {
      const provider = getChannelProvider(entry.channel.type)
      await provider.shutdown(entry.channel)
    } catch {
      // Ignore shutdown errors
    }
    managed.delete(channelId)
  },

  async reloadChannel(channel: ChannelRecord) {
    await this.disconnectChannel(channel.id)
    await this.connectChannel(channel)
  },

  isConnected(channelId: string): boolean {
    return managed.has(channelId)
  },

  async shutdown() {
    for (const [id] of managed) {
      await this.disconnectChannel(id)
    }
    managed.clear()
    started = false
  },
}
