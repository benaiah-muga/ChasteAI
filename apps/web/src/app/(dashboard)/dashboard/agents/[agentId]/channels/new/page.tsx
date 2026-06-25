import { ChannelForm } from "./channel-form"

export default async function NewChannelPage({
  params,
}: {
  params: Promise<{ agentId: string }>
}) {
  const { agentId } = await params

  return (
    <div className="mx-auto max-w-2xl px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[#0f172a]">
          Create channel
        </h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Connect your agent to a new conversation channel.
        </p>
      </div>
      <ChannelForm agentId={agentId} />
    </div>
  )
}
