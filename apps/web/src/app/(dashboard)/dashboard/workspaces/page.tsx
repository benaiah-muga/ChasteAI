import { appRouter } from "@/server/api/root"
import { createTRPCContext } from "@/server/api/trpc"
import { WorkspacesClient } from "./workspaces-client"

export default async function WorkspacesPage() {
  const ctx = await createTRPCContext()
  const caller = appRouter.createCaller(ctx)
  const workspaces = await caller.workspace.list()

  return <WorkspacesClient workspaces={workspaces} />
}
