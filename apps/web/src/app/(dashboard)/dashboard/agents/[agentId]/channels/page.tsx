import { appRouter } from "@/server/api/root"
import { createTRPCContext } from "@/server/api/trpc"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChannelsClient } from "./channels-client"

export default async function AgentChannelsPage({
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

  const channelList = await caller.channel.list({ agentId })

  let agent
  try {
    agent = await caller.agent.getById({ id: agentId })
  } catch {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-8 py-8">
      <div>
        <Link
          href={`/dashboard/agents/${agentId}`}
          className="text-text-tertiary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {agent.name}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-text-primary font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
              Channels
            </h1>
            <p className="text-text-muted mt-1 text-sm">
              Connect {agent.name} to conversation channels.
            </p>
          </div>
          <Link href={`/dashboard/agents/${agentId}/channels/new`}>
            <Button variant="primary" size="md">
              <Plus className="mr-1.5 h-4 w-4" />
              New channel
            </Button>
          </Link>
        </div>
      </div>

      <ChannelsClient channels={channelList} agentId={agentId} />
    </div>
  )
}
