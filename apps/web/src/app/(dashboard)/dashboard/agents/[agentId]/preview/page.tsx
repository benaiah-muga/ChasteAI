import { appRouter } from "@/server/api/root"
import { createTRPCContext } from "@/server/api/trpc"
import { notFound, redirect } from "next/navigation"
import { TRPCError } from "@trpc/server"
import { PreviewClient } from "./preview-client"

export default async function PreviewPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params
  const ctx = await createTRPCContext()

  if (!ctx.session?.user) {
    redirect("/signin")
  }

  const caller = appRouter.createCaller(ctx)

  let agent
  try {
    agent = await caller.agent.getById({ id: agentId })
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      notFound()
    }
    throw error
  }

  let channels: {
    id: string
    type: string
    name: string
    config: Record<string, unknown> | null
  }[] = []
  try {
    channels = await caller.channel.list({ agentId })
  } catch {
    // ignore
  }

  const widgetChannel = channels.find((c) => c.type === "widget")

  if (!widgetChannel) {
    notFound()
  }

  return <PreviewClient agent={agent} widgetChannel={widgetChannel} />
}
