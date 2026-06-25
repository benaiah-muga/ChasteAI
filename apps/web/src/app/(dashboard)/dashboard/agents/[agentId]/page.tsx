import { appRouter } from "@/server/api/root"
import { createTRPCContext } from "@/server/api/trpc"
import { notFound, redirect } from "next/navigation"
import { TRPCError } from "@trpc/server"
import { AgentDetailClient } from "./agent-detail-client"

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ agentId: string }>
}) {
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

  return <AgentDetailClient agent={agent} />
}
