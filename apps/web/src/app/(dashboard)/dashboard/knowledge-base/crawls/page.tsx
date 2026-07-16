import { appRouter } from "@/server/api/root"
import { createTRPCContext } from "@/server/api/trpc"
import { CrawlsClient } from "./crawls-client"

export default async function CrawlsPage() {
  const ctx = await createTRPCContext()
  const caller = appRouter.createCaller(ctx)
  const docs = await caller.document.list()

  return <CrawlsClient documents={docs} />
}
