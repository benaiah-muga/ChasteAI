import { appRouter } from "@/server/api/root"
import { createTRPCContext } from "@/server/api/trpc"
import { redirect } from "next/navigation"
import { NewAgentForm } from "./new-agent-form"

export default async function NewAgentPage() {
  const ctx = await createTRPCContext()

  if (!ctx.session?.user) {
    redirect("/signin")
  }

  const caller = appRouter.createCaller(ctx)
  const workspaces = await caller.workspace.list()

  if (workspaces.length === 0) {
    redirect("/dashboard")
  }

  return (
    <div className="mx-auto max-w-2xl px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[#0f172a]">
          Create agent
        </h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Configure a new AI agent to handle conversations.
        </p>
      </div>
      <NewAgentForm
        workspaces={workspaces.map(({ workspaces: ws }) => ({
          id: ws.id,
          name: ws.name,
        }))}
      />
    </div>
  )
}
