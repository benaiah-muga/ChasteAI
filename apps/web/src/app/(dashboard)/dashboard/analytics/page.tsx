import { appRouter } from "@/server/api/root"
import { createTRPCContext } from "@/server/api/trpc"
import { AnalyticsClient } from "./analytics-client"

export default async function AnalyticsPage() {
  const ctx = await createTRPCContext()
  const caller = appRouter.createCaller(ctx)

  const [overview, volume, statusDist, agentRanking, channelDist] = await Promise.all([
    caller.analytics.overview(),
    caller.analytics.conversationVolume({ days: 30 }),
    caller.analytics.statusDistribution(),
    caller.analytics.agentRanking(),
    caller.analytics.channelDistribution(),
  ])

  return (
    <AnalyticsClient
      overview={overview}
      volume={volume}
      statusDistribution={statusDist}
      agentRanking={agentRanking}
      channelDistribution={channelDist}
    />
  )
}
