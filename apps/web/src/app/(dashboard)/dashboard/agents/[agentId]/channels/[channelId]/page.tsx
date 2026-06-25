import { appRouter } from "@/server/api/root"
import { createTRPCContext } from "@/server/api/trpc"
import { redirect, notFound } from "next/navigation"
import { ChannelDetailClient } from "./channel-detail-client"

export default async function ChannelDetailPage({
  params,
}: {
  params: Promise<{ agentId: string; channelId: string }>
}) {
  const { agentId, channelId } = await params
  const ctx = await createTRPCContext()

  if (!ctx.session?.user) {
    redirect("/signin")
  }

  const caller = appRouter.createCaller(ctx)

  let agent
  try {
    agent = await caller.agent.getById({ id: agentId })
  } catch {
    notFound()
  }

  let channel
  try {
    channel = await caller.channel.getById({ id: channelId })
  } catch {
    notFound()
  }

  return (
    <ChannelDetailClient
      agent={agent}
      channel={channel}
      agentId={agentId}
    />
  )
}
