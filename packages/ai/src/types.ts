import { z } from "zod"

// ── Model ─────────────────────────────────────────
export type Model = {
  id: string
  name: string
  provider: string
  capabilities: {
    streaming: boolean
    functionCalling: boolean
    embeddings: boolean
    vision: boolean
  }
  contextWindow: number
  maxOutputTokens: number
}

// ── Chat ──────────────────────────────────────────
export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string(),
  toolCalls: z.array(z.record(z.unknown())).optional(),
  toolCallId: z.string().optional(),
  name: z.string().optional(),
})

export type ChatMessage = z.infer<typeof ChatMessageSchema>

export const ChatParamsSchema = z.object({
  model: z.string(),
  messages: z.array(ChatMessageSchema),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
  topP: z.number().min(0).max(1).optional(),
  tools: z.array(z.record(z.unknown())).optional(),
  stream: z.boolean().default(false),
})

export type ChatParams = z.infer<typeof ChatParamsSchema>

export type ChatResponse = {
  id: string
  model: string
  message: ChatMessage
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export type ChatChunk = {
  id: string
  model: string
  content: string
  toolCalls?: Record<string, unknown>[]
  finishReason?: "stop" | "length" | "tool_calls" | "error" | null
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// ── Embeddings ────────────────────────────────────
export type EmbeddingParams = {
  model: string
  input: string | string[]
}

export type EmbeddingResponse = {
  embedding: number[]
  index: number
}

// ── Health ─────────────────────────────────────────
export type HealthStatus = {
  healthy: boolean
  message?: string
  latency?: number
}

export type ConnectionResult = {
  success: boolean
  message?: string
  models?: Model[]
}

// ── Provider Config ───────────────────────────────
export const ProviderConfigSchema = z.object({
  type: z.string(),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  model: z.string(),
  parameters: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().positive().optional(),
      topP: z.number().min(0).max(1).optional(),
    })
    .optional(),
  embedding: z
    .object({
      model: z.string().optional(),
      baseUrl: z.string().optional(),
      apiKey: z.string().optional(),
      dimensions: z.number().positive().optional(),
    })
    .optional(),
  contentSafety: z
    .object({
      enabled: z.boolean().optional(),
      checkInput: z.boolean().optional(),
      checkResponse: z.boolean().optional(),
      apiKey: z.string().optional(),
      baseUrl: z.string().optional(),
      model: z.string().optional(),
      customPolicy: z.string().optional(),
    })
    .optional(),
  failover: z
    .object({
      enabled: z.boolean().optional(),
      fallbackProvider: z.string().optional(),
      fallbackModel: z.string().optional(),
    })
    .optional(),
})

export type ProviderConfig = z.infer<typeof ProviderConfigSchema>
