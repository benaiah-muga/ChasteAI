import { appRouter } from "@/server/api/root"
import { createTRPCContext } from "@/server/api/trpc"
import { ChannelsClient } from "./channels-client"

export default async function ChannelsPage() {
  const ctx = await createTRPCContext()
  const caller = appRouter.createCaller(ctx)

  const agents = await caller.agent.list()
  const channelResults = await Promise.all(
    agents.map((a) =>
      caller.channel
        .list({ agentId: a.id })
        .then((chans) => chans.map((c) => ({ ...c, agentName: a.name }))),
    ),
  )
  const channels = channelResults.flat()

  return <ChannelsClient channels={channels} agents={agents} />
}
