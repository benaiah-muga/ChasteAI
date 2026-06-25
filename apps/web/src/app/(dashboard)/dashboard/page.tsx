import { appRouter } from "@/server/api/root"
import { createTRPCContext } from "@/server/api/trpc"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const ctx = await createTRPCContext()
  const caller = appRouter.createCaller(ctx)
  const workspaces = await caller.workspace.list()

  return <DashboardClient workspaces={workspaces} />
}
