import { providerRegistry } from "./registry"
import type { ProviderConfig } from "./types"
import type { AIProvider } from "./types/provider"

export function createProvider(config: ProviderConfig): AIProvider {
  return providerRegistry.create(config)
}

export function getAvailableProviderTypes(): string[] {
  return providerRegistry.getAvailableTypes()
}

export { providerRegistry } from "./registry"
export type { AIProvider, ProviderFactory } from "./types/provider"
