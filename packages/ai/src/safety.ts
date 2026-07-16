import OpenAI from "openai"

export type ContentSafetyConfig = {
  enabled: boolean
  checkInput?: boolean
  checkResponse?: boolean
  apiKey?: string
  baseUrl?: string
  model?: string
  customPolicy?: string
}

export type SafetyCheckResult = {
  inputSafe: boolean
  responseSafe: boolean
  categories?: string[]
  rawResponse?: string
}

const DEFAULT_SAFETY_MODEL = "nvidia/nemotron-3.5-content-safety"
const DEFAULT_SAFETY_BASE_URL = "https://integrate.api.nvidia.com/v1"

export async function checkContentSafety(
  input: string,
  response: string | null,
  config: ContentSafetyConfig,
): Promise<SafetyCheckResult> {
  if (!config.enabled) {
    return { inputSafe: true, responseSafe: true }
  }

  const shouldCheckInput = config.checkInput ?? false
  const shouldCheckResponse = config.checkResponse ?? true

  if (!shouldCheckInput && !shouldCheckResponse) {
    return { inputSafe: true, responseSafe: true }
  }

  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl ?? DEFAULT_SAFETY_BASE_URL,
  })

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [{ role: "user", content: input }]

  if (shouldCheckResponse && response) {
    messages.push({ role: "assistant", content: response })
  }

  const extraBody: Record<string, unknown> = {
    chat_template_kwargs: {
      request_categories: "/categories",
      enable_thinking: false,
    },
  }

  if (config.customPolicy) {
    ;(extraBody.chat_template_kwargs as Record<string, unknown>).custom_policy = config.customPolicy
    ;(extraBody.chat_template_kwargs as Record<string, unknown>).enable_thinking = true
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completion = await (client.chat.completions.create as any)({
    model: config.model ?? DEFAULT_SAFETY_MODEL,
    messages,
    max_tokens: 200,
    temperature: 0.01,
    top_p: 0.95,
    extra_body: extraBody,
  })

  const raw: string = completion.choices?.[0]?.message?.content ?? ""

  const modelInputSafe = !raw.includes("User Safety: unsafe")
  const modelResponseSafe = !raw.includes("Response Safety: unsafe")

  const inputSafe = shouldCheckInput ? modelInputSafe : true
  const responseSafe = shouldCheckResponse ? modelResponseSafe : true

  const categories: string[] = []
  const catMatch = raw.match(/Safety Categories?:\s*(.+)/i)
  if (catMatch?.[1]) {
    categories.push(
      ...catMatch[1]
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
    )
  }

  return {
    inputSafe,
    responseSafe,
    categories: categories.length > 0 ? categories : undefined,
    rawResponse: raw,
  }
}
