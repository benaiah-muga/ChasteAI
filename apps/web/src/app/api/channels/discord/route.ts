import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (body.type === 1) {
      return NextResponse.json({ type: 1 })
    }

    return NextResponse.json({ type: 1 })
  } catch {
    return NextResponse.json({ type: 1 })
  }
}
