import { appRouter } from "@/server/api/root"
import { createTRPCContext } from "@/server/api/trpc"
import { ConversationsClient } from "./conversations-client"

export default async function ConversationsPage() {
  const ctx = await createTRPCContext()
  const caller = appRouter.createCaller(ctx)

  const conversations = await caller.conversation.list()

  return <ConversationsClient conversations={conversations} />
}
