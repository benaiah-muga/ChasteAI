import type { ChannelProvider } from "./types"

class ChannelRegistry {
  private providers = new Map<string, ChannelProvider>()

  register(provider: ChannelProvider) {
    this.providers.set(provider.type, provider)
  }

  get(type: string): ChannelProvider | undefined {
    return this.providers.get(type)
  }

  getAll(): ChannelProvider[] {
    return Array.from(this.providers.values())
  }
}

export const channelRegistry = new ChannelRegistry()
