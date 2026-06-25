import { appRouter } from "@/server/api/root"
import { createTRPCContext } from "@/server/api/trpc"
import { redirect, notFound } from "next/navigation"
import { ConversationsList } from "./conversations-list"

export default async function AgentConversationsPage({
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
  } catch {
    notFound()
  }

  const conversationList = await caller.conversation.list({ agentId })

  return (
    <ConversationsList
      agent={agent}
      conversations={conversationList}
    />
  )
}
