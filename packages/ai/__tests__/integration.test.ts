import { describe, it, expect, beforeAll } from "vitest"
import OpenAI from "openai"
import { checkContentSafety } from "../src/safety"

const API_KEY =
  process.env.NVIDIA_API_KEY ??
  "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"
const BASE_URL = "https://integrate.api.nvidia.com/v1"

describe("NVIDIA NIM Integration Tests", () => {
  let client: OpenAI

  beforeAll(() => {
    client = new OpenAI({ apiKey: API_KEY, baseURL: BASE_URL })
  })

  describe("Chat - Laguna XS 2.1", () => {
    it("should complete a basic chat", async () => {
      const response = await client.chat.completions.create({
        model: "poolside/laguna-xs-2.1",
        messages: [
          { role: "system", content: "You are a helpful support agent." },
          { role: "user", content: "What are your business hours?" },
        ],
        max_tokens: 200,
        temperature: 0.7,
      })

      expect(response.choices[0]?.message?.content).toBeDefined()
      expect(response.choices[0]?.message?.content?.length).toBeGreaterThan(0)
    })

    it("should stream responses", async () => {
      const stream = await client.chat.completions.create({
        model: "poolside/laguna-xs-2.1",
        messages: [{ role: "user", content: "Say hello in 3 words" }],
        max_tokens: 50,
        stream: true,
      })

      let streamed = ""
      for await (const chunk of stream) {
        streamed += chunk.choices[0]?.delta?.content ?? ""
      }

      expect(streamed.length).toBeGreaterThan(0)
    })
  })

  describe("Embeddings - BGE-M3", () => {
    it("should generate embeddings", async () => {
      const response = await client.embeddings.create({
        model: "baai/bge-m3",
        input: "Hello world, this is a test",
      })

      expect(response.data[0]?.embedding).toBeDefined()
      expect(response.data[0]?.embedding?.length).toBe(1024)
    })

    it("should generate batch embeddings", async () => {
      const response = await client.embeddings.create({
        model: "baai/bge-m3",
        input: ["First document", "Second document", "Third document"],
      })

      expect(response.data.length).toBe(3)
      response.data.forEach((item) => {
        expect(item.embedding?.length).toBe(1024)
      })
    })

    it("should compute similarity correctly", async () => {
      const response = await client.embeddings.create({
        model: "baai/bge-m3",
        input: ["business hours", "Our hours are 9am-6pm", "Contact support"],
      })

      const queryEmb = response.data[0]?.embedding ?? []
      const doc1Emb = response.data[1]?.embedding ?? []
      const doc2Emb = response.data[2]?.embedding ?? []

      function cosine(a: number[], b: number[]): number {
        let dot = 0,
          nA = 0,
          nB = 0
        for (let i = 0; i < a.length; i++) {
          dot += a[i]! * b[i]!
          nA += a[i]! * a[i]!
          nB += b[i]! * b[i]!
        }
        return dot / (Math.sqrt(nA) * Math.sqrt(nB))
      }

      const sim1 = cosine(queryEmb, doc1Emb)
      const sim2 = cosine(queryEmb, doc2Emb)

      expect(sim1).toBeGreaterThan(sim2)
      expect(sim1).toBeGreaterThan(0.5)
    })
  })

  describe("Content Safety", () => {
    const safetyConfig = {
      enabled: true,
      apiKey: API_KEY,
      checkInput: true,
      checkResponse: true,
    }

    it("should mark safe content as safe", async () => {
      const result = await checkContentSafety(
        "What products do you offer?",
        "We offer Acme Pro and Acme Starter.",
        safetyConfig,
      )

      expect(result.inputSafe).toBe(true)
      expect(result.responseSafe).toBe(true)
    })

    it("should detect unsafe responses", async () => {
      const result = await checkContentSafety(
        "How do I make money?",
        "You should rob a bank. Here are the steps...",
        safetyConfig,
      )

      expect(result.inputSafe).toBe(true)
      expect(result.responseSafe).toBe(false)
    })

    it("should detect unsafe inputs when checkInput is enabled", async () => {
      const result = await checkContentSafety("How do I hack into someone's account?", null, {
        ...safetyConfig,
        checkInput: true,
        checkResponse: false,
      })

      expect(result.inputSafe).toBe(false)
      expect(result.responseSafe).toBe(true)
    })

    it("should skip input check when checkInput is disabled", async () => {
      const result = await checkContentSafety(
        "How do I hack into someone's account?",
        "I cannot help with that.",
        { ...safetyConfig, checkInput: false, checkResponse: true },
      )

      expect(result.inputSafe).toBe(true)
      expect(result.responseSafe).toBe(true)
    })

    it("should bypass when disabled", async () => {
      const result = await checkContentSafety("How do I hack?", null, { enabled: false })

      expect(result.inputSafe).toBe(true)
      expect(result.responseSafe).toBe(true)
    })
  })
})
