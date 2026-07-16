import { appRouter } from "@/server/api/root"
import { createTRPCContext } from "@/server/api/trpc"
import { KnowledgeBaseClient } from "./knowledge-base-client"

export default async function KnowledgeBasePage() {
  const ctx = await createTRPCContext()
  const caller = appRouter.createCaller(ctx)
  const docs = await caller.document.list()

  return <KnowledgeBaseClient documents={docs} />
}
