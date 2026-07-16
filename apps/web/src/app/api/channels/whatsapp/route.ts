import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token) {
    return new NextResponse(challenge)
  }

  return new NextResponse("Forbidden", { status: 403 })
}

export async function POST(_request: Request) {
  return NextResponse.json({ ok: true })
}
