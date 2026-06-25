import { appRouter } from "@/server/api/root"
import { createTRPCContext } from "@/server/api/trpc"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
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
    <div className="mx-auto max-w-4xl px-8 py-8">
      <div className="mb-8">
        <Link
          href={`/dashboard/agents/${agentId}`}
          className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-[#64748b] hover:text-[#0f172a]"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to {agent.name}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#0f172a]">
              Channels
            </h1>
            <p className="mt-1 text-sm text-[#64748b]">
              Connect {agent.name} to conversation channels.
            </p>
          </div>
          <Link
            href={`/dashboard/agents/${agentId}/channels/new`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4f46e5]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New channel
          </Link>
        </div>
      </div>

      <ChannelsClient channels={channelList} agentId={agentId} />
    </div>
  )
}
