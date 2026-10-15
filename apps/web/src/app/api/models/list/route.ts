import { NextRequest } from "next/server"
import { createProvider } from "@chaste-ai/ai"
import { auth } from "@/auth"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  let body: { type?: string; apiKey?: string; baseUrl?: string }
  try {
    body = await req.json()
  } catch {
    return new Response("Invalid JSON", { status: 400 })
  }

  const { type = "openai-compatible", apiKey, baseUrl } = body

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const provider = createProvider({
      type,
      apiKey,
      baseUrl: baseUrl || undefined,
      model: "gpt-4o",
    })

    const models = await provider.listModels()

    return new Response(JSON.stringify({ models }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch models",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
