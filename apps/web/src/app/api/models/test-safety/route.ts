import { NextRequest } from "next/server"
import { auth } from "@/auth"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  let body: { apiKey?: string; baseUrl?: string; model?: string }
  try {
    body = await req.json()
  } catch {
    return new Response("Invalid JSON", { status: 400 })
  }

  const { apiKey, baseUrl, model } = body

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const { checkContentSafety } = await import("@chaste-ai/ai")

    await checkContentSafety("Hello, this is a connection test.", null, {
      enabled: true,
      apiKey,
      baseUrl,
      model,
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Could not connect to the content safety model",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
