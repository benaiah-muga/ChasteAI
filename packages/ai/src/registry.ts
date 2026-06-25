import type { AIProvider, ProviderFactory } from "./types/provider"
import type { ProviderConfig } from "./types"

class ProviderRegistry {
  private factories = new Map<string, ProviderFactory>()

  register(type: string, factory: ProviderFactory): void {
    if (this.factories.has(type)) {
      throw new Error(`Provider type "${type}" is already registered`)
    }
    this.factories.set(type, factory)
  }

  create(config: ProviderConfig): AIProvider {
    const factory = this.factories.get(config.type)
    if (!factory) {
      throw new Error(
        `Unknown provider type: "${config.type}". Available: ${Array.from(this.factories.keys()).join(", ")}`,
      )
    }
    return factory(config as unknown as Record<string, unknown>)
  }

  getAvailableTypes(): string[] {
    return Array.from(this.factories.keys())
  }

  hasType(type: string): boolean {
    return this.factories.has(type)
  }
}

export const providerRegistry = new ProviderRegistry()
