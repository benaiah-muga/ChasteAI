import { appRouter } from "@/server/api/root"
import { createTRPCContext } from "@/server/api/trpc"
import { AgentsClient } from "./agents-client"

export default async function AgentsPage() {
  const ctx = await createTRPCContext()
  const caller = appRouter.createCaller(ctx)
  const agents = await caller.agent.list()
  const workspaces = await caller.workspace.list()

  return (
    <AgentsClient
      agents={agents}
      workspaces={workspaces.map(({ workspaces: ws }) => ws)}
    />
  )
}
