import { NewAgentForm } from "./new-agent-form"

export default async function NewAgentPage() {
  return (
    <div className="mx-auto max-w-2xl px-8 py-8">
      <div className="mb-8">
        <h1 className="text-text-primary text-2xl font-semibold tracking-tight">Create agent</h1>
        <p className="text-text-tertiary mt-1 text-sm">
          Configure a new AI agent to handle conversations.
        </p>
      </div>
      <NewAgentForm />
    </div>
  )
}
