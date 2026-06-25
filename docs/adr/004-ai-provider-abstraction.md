# ADR-004: AI Provider Abstraction Pattern

**Status:** Proposed

**Date:** 2026-06-25

## Context

ChasteAI must remain provider-agnostic. Users should be able to use OpenAI, Anthropic, Ollama (local), Grok, vLLM, or any OpenAI-compatible API without modifying application code. The abstraction must support:
- Chat completion (streaming and non-streaming)
- Embedding generation
- Model listing
- Health checks and connection testing
- Tool/function calling
- Retries and failover hooks
- Per-request provider override

## Decision

Implement a **strategy-pattern provider abstraction** in `packages/ai`.

### Core Interface

```typescript
interface AIProvider {
  readonly id: string
  readonly name: string
  readonly type: ProviderType  // "openai" | "anthropic" | "ollama" | "openai-compatible"

  models(): Promise<Model[]>
  chat(params: ChatParams): Promise<ChatResponse>
  chatStream(params: ChatParams): AsyncIterable<ChatChunk>
  embeddings(params: EmbeddingParams): Promise<EmbeddingResponse[]>
  checkHealth(): Promise<HealthStatus>
  testConnection(): Promise<ConnectionResult>
}
```

### Registry Pattern

Providers self-register via a registry:

```typescript
class ProviderRegistry {
  private providers = new Map<string, ProviderFactory>()

  register(type: string, factory: ProviderFactory): void
  create(config: ProviderConfig): AIProvider
  getAvailableTypes(): string[]
}
```

### Configuration Model

Provider configuration is stored per-workspace in the `agents` table as JSON:

```typescript
type ProviderConfig = {
  type: string
  apiKey?: string        // Encrypted at rest
  baseUrl?: string       // For self-hosted / OpenAI-compatible
  model: string
  parameters: {
    temperature?: number
    maxTokens?: number
    topP?: number
    // Provider-specific params stored as additional keys
  }
  failover?: {
    enabled: boolean
    fallbackProvider?: string
    fallbackModel?: string
  }
}
```

### Provider Implementations (Phase 1)

| Provider | File | Notes |
|---|---|---|
| OpenAI | `providers/openai.ts` | Native SDK, streaming, embeddings |
| Ollama | `providers/ollama.ts` | Local inference, HTTP API |
| Anthropic | `providers/anthropic.ts` | Messages API, streaming |
| OpenAI-compatible | `providers/openai-compatible.ts` | Any OpenAI-compatible endpoint (vLLM, LM Studio, etc.) |

### Usage in Application Code

No application code should import an AI provider SDK directly. All access goes through the `createProvider()` factory:

```typescript
// Good — in a tRPC router
const provider = createProvider(agent.providerConfig)
const response = await provider.chat({ messages, tools })

// Bad — don't do this
import OpenAI from "openai"
const openai = new OpenAI({ apiKey: "..." })
```

## Consequences

### Positive

- Providers are swappable at the workspace/agent level without code changes
- Adding a new provider is a single file + one line in the registry
- Testing is straightforward — mock the `AIProvider` interface
- Failover logic is centralized in the provider wrapper, not scattered across routers
- Embedding providers share the same abstraction

### Negative

- The interface must be generic enough to accommodate all providers — some provider-specific features may not be exposed initially
- Provider-specific streaming formats need normalization
- Rate limiting and error handling must be uniform across implementations

### Neutral

- The abstraction can be published as its own npm package later if useful

## Alternatives Considered

- **LangChain / Vercel AI SDK**: Both are excellent but introduce heavy abstraction chains. ChasteAI's needs are focused enough that a thin, purpose-built abstraction is more maintainable and has a smaller surface area. Vercel AI SDK may be used selectively for streaming normalization.
- **Direct SDK per provider**: Would couple business logic to provider APIs, violating the core provider-agnostic principle. Every workspace change would require a deploy.
- **Single provider only**: Contradicts the PRD's provider-agnostic requirement.
