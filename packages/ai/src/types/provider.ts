import type {
  ChatParams,
  ChatResponse,
  ChatChunk,
  EmbeddingParams,
  EmbeddingResponse,
  HealthStatus,
  ConnectionResult,
  Model,
} from "../types"

export interface AIProvider {
  readonly id: string
  readonly name: string
  readonly type: string

  listModels(): Promise<Model[]>
  chat(params: ChatParams): Promise<ChatResponse>
  chatStream(params: ChatParams): AsyncIterable<ChatChunk>
  embeddings(params: EmbeddingParams): Promise<EmbeddingResponse[]>
  checkHealth(): Promise<HealthStatus>
  testConnection(): Promise<ConnectionResult>
}

export type ProviderFactory = (config: Record<string, unknown>) => AIProvider
