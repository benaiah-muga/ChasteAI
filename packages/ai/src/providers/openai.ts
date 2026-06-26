import OpenAI from "openai"
import type { AIProvider } from "../types/provider"
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
import { providerRegistry } from "../registry"

type OpenAICompatibleConfig = {
  apiKey?: string
  baseUrl?: string
  model?: string
  type?: string
  name?: string
}

class OpenAICompatibleProvider implements AIProvider {
  readonly id: string
  readonly name: string
  readonly type: string

  private client: OpenAI
  private defaultModel: string

  constructor(config: OpenAICompatibleConfig) {
    this.id = config.type ?? "openai-compatible"
    this.name = config.name ?? "OpenAI-Compatible"
    this.type = config.type ?? "openai-compatible"

    this.client = new OpenAI({
      apiKey: config.apiKey ?? process.env.OPENAI_API_KEY ?? process.env.GROQ_API_KEY,
      baseURL: config.baseUrl,
    })
    this.defaultModel = config.model ?? "gpt-4o"
  }

  async listModels(): Promise<Model[]> {
    const response = await this.client.models.list()
    return response.data.map((model) => ({
      id: model.id,
      name: model.id,
      provider: this.id,
      capabilities: {
        streaming: true,
        functionCalling: true,
        embeddings: model.id.includes("embedding"),
        vision: model.id.includes("vision") || model.id.includes("gpt-4o"),
      },
      contextWindow: 128_000,
      maxOutputTokens: 16_384,
    }))
  }

  async chat(params: ChatParams): Promise<ChatResponse> {
    const response = await this.client.chat.completions.create({
      model: params.model ?? this.defaultModel,
      messages: params.messages as OpenAI.Chat.ChatCompletionMessageParam[],
      temperature: params.temperature,
      max_tokens: params.maxTokens,
      top_p: params.topP,
      tools: params.tools as unknown as OpenAI.Chat.ChatCompletionTool[],
      stream: false,
    })

    const choice = response.choices[0]
    if (!choice) throw new Error("No response from AI provider")

    return {
      id: response.id,
      model: response.model,
      message: {
        role: choice.message.role as "assistant",
        content: choice.message.content ?? "",
        toolCalls: choice.message.tool_calls as unknown as Record<string, unknown>[],
      },
      usage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
    }
  }

  async *chatStream(params: ChatParams): AsyncIterable<ChatChunk> {
    const stream = await this.client.chat.completions.create({
      model: params.model ?? this.defaultModel,
      messages: params.messages as OpenAI.Chat.ChatCompletionMessageParam[],
      temperature: params.temperature,
      max_tokens: params.maxTokens,
      top_p: params.topP,
      tools: params.tools as unknown as OpenAI.Chat.ChatCompletionTool[],
      stream: true,
      stream_options: { include_usage: true },
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta
      yield {
        id: chunk.id,
        model: chunk.model,
        content: delta?.content ?? "",
        toolCalls: delta?.tool_calls as unknown as Record<string, unknown>[],
        finishReason: chunk.choices[0]?.finish_reason as ChatChunk["finishReason"],
        usage: chunk.usage
          ? {
              promptTokens: chunk.usage.prompt_tokens,
              completionTokens: chunk.usage.completion_tokens,
              totalTokens: chunk.usage.total_tokens,
            }
          : undefined,
      }
    }
  }

  async embeddings(params: EmbeddingParams): Promise<EmbeddingResponse[]> {
    const model = params.model ?? "text-embedding-3-small"
    const input = Array.isArray(params.input) ? params.input : [params.input]

    const response = await this.client.embeddings.create({
      model,
      input,
    })

    return response.data.map((item) => ({
      embedding: item.embedding,
      index: item.index,
    }))
  }

  async checkHealth(): Promise<HealthStatus> {
    const start = performance.now()
    try {
      await this.client.models.list()
      return {
        healthy: true,
        latency: Math.round(performance.now() - start),
      }
    } catch (error) {
      return {
        healthy: false,
        message: error instanceof Error ? error.message : "Unknown error",
        latency: Math.round(performance.now() - start),
      }
    }
  }

  async testConnection(): Promise<ConnectionResult> {
    try {
      const models = await this.listModels()
      return {
        success: true,
        models: models.slice(0, 10),
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Connection test failed",
      }
    }
  }
}

providerRegistry.register("openai", (config) => new OpenAICompatibleProvider(config as OpenAICompatibleConfig))
providerRegistry.register("openai-compatible", (config) => new OpenAICompatibleProvider(config as OpenAICompatibleConfig))
