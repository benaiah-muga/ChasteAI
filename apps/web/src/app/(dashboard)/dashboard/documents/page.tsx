import { appRouter } from "@/server/api/root"
import { createTRPCContext } from "@/server/api/trpc"
import { DocumentsClient } from "./documents-client"

export default async function DocumentsPage() {
  const ctx = await createTRPCContext()
  const caller = appRouter.createCaller(ctx)
  const docs = await caller.document.list()

  return <DocumentsClient documents={docs} />
}
