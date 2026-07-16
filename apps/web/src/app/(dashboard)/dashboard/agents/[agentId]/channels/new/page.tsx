import { ChannelForm } from "./channel-form"

export default async function NewChannelPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-8 py-8">
      <div>
        <h1 className="text-text-primary font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Create channel
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Connect your agent to a new conversation channel.
        </p>
      </div>
      <ChannelForm agentId={agentId} />
    </div>
  )
}
