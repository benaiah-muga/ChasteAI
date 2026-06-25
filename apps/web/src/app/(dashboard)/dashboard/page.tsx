import { appRouter } from "@/server/api/root"
import { createTRPCContext } from "@/server/api/trpc"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const ctx = await createTRPCContext()
  const caller = appRouter.createCaller(ctx)

  const [workspaces, stats, recentConversations] = await Promise.all([
    caller.workspace.list(),
    caller.dashboard.stats(),
    caller.dashboard.recentConversations(),
  ])

  return (
    <DashboardClient
      workspaces={workspaces}
      stats={stats}
      recentConversations={recentConversations}
    />
  )
}
