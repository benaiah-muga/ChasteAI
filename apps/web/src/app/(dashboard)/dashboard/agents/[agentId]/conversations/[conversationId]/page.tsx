import { appRouter } from "@/server/api/root"
import { createTRPCContext } from "@/server/api/trpc"
import { redirect, notFound } from "next/navigation"
import { ChatView } from "./chat-view"

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ agentId: string; conversationId: string }>
}) {
  const { agentId, conversationId } = await params
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

  let data
  try {
    data = await caller.conversation.getById({ id: conversationId })
  } catch {
    notFound()
  }

  return (
    <ChatView
      agentId={agentId}
      agentName={agent.name}
      conversationId={conversationId}
      initialMessages={data.messages}
    />
  )
}
