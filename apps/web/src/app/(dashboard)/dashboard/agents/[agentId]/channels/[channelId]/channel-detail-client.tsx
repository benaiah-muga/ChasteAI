"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/trpc/react"

type Agent = {
  id: string
  name: string
}

type Channel = {
  id: string
  agentId: string
  type: string
  name: string
  config: Record<string, unknown> | null
  isActive: string
  createdAt: Date
  updatedAt: Date
}

export function ChannelDetailClient({
  agent,
  channel: initial,
  agentId,
}: {
  agent: Agent
  channel: Channel
  agentId: string
}) {
  const router = useRouter()
  const utils = api.useUtils()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(initial.name)
  const [isActive, setIsActive] = useState(initial.isActive)

  const [botToken, setBotToken] = useState((initial.config?.botToken as string) ?? "")
  const [appToken, setAppToken] = useState((initial.config?.appToken as string) ?? "")
  const [signingSecret, setSigningSecret] = useState(
    (initial.config?.signingSecret as string) ?? "",
  )
  const [applicationId, setApplicationId] = useState(
    (initial.config?.applicationId as string) ?? "",
  )
  const [publicKey, setPublicKey] = useState((initial.config?.publicKey as string) ?? "")
  const [phoneNumber, setPhoneNumber] = useState((initial.config?.phoneNumber as string) ?? "")
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null)
  const [testLoading, setTestLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)

  const updateChannel = api.channel.update.useMutation({
    onSuccess: () => {
      utils.channel.list.invalidate({ agentId })
      utils.channel.getById.invalidate({ id: initial.id })
      setIsEditing(false)
      router.refresh()
    },
  })

  const deleteChannel = api.channel.delete.useMutation({
    onSuccess: () => {
      utils.channel.list.invalidate({ agentId })
      router.push(`/dashboard/agents/${agentId}/channels`)
    },
  })

  const testConnection = api.channel.testConnection.useMutation({
    onSuccess: (result) => setTestResult(result),
    onError: (error) => setTestResult({ success: false, message: error.message }),
  })

  const { data: qrData } = api.channel.getQRCode.useQuery(
    { id: initial.id },
    { enabled: initial.type === "whatsapp" },
  )

  useEffect(() => {
    if (qrData) setQrCode(qrData)
  }, [qrData])

  function buildConfig(): Record<string, unknown> {
    switch (initial.type) {
      case "telegram":
        return { botToken }
      case "slack":
        return { botToken, appToken, signingSecret }
      case "discord":
        return { botToken, applicationId, publicKey }
      case "whatsapp":
        return { phoneNumber }
      default:
        return { ...initial.config }
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    updateChannel.mutate({
      id: initial.id,
      data: { name, isActive, config: buildConfig() },
    })
  }

  async function handleDelete() {
    if (confirm(`Delete channel "${initial.name}"?`)) {
      deleteChannel.mutate({ id: initial.id })
    }
  }

  async function handleTestConnection() {
    setTestLoading(true)
    setTestResult(null)

    testConnection.mutate({ id: initial.id })
    setTestLoading(false)
  }

  const origin = typeof window !== "undefined" ? window.location.origin : ""

  const embedCode =
    initial.type === "widget"
      ? `<script>
  (function(w,d,s,o,f){
    w['ChasteAI']=f;w[f]=w[f]||function(){(w[f].q=w[f].q||[]).push(arguments)};
    var g=d.createElement(s),r=d.getElementsByTagName(s)[0];
    g.async=1;g.src=o;r.parentNode.insertBefore(g,r);
  })(window,document,'script','${origin}/widget/embed.js','chasteai');
  chasteai('init', '${initial.id}');
</script>`
      : null

  function renderConfigForm() {
    switch (initial.type) {
      case "telegram":
        return (
          <div>
            <label className="text-text-primary mb-1.5 block text-sm font-medium">Bot Token</label>
            <input
              type="password"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
            />
            <p className="text-text-muted mt-1 text-xs">
              Create a bot via{" "}
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                @BotFather
              </a>{" "}
              and paste the token here.
            </p>
          </div>
        )
      case "slack":
        return (
          <>
            <div>
              <label className="text-text-primary mb-1.5 block text-sm font-medium">
                Bot Token
              </label>
              <input
                type="password"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
                placeholder="xoxb-..."
              />
            </div>
            <div>
              <label className="text-text-primary mb-1.5 block text-sm font-medium">
                App Token
              </label>
              <input
                type="password"
                value={appToken}
                onChange={(e) => setAppToken(e.target.value)}
                className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
                placeholder="xapp-..."
              />
            </div>
            <div>
              <label className="text-text-primary mb-1.5 block text-sm font-medium">
                Signing Secret
              </label>
              <input
                type="password"
                value={signingSecret}
                onChange={(e) => setSigningSecret(e.target.value)}
                className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
                placeholder="abc123def456..."
              />
            </div>
            <p className="text-text-muted text-xs">
              Create a Slack app with Socket Mode enabled, add the bot token and app-level token
              from your app's settings.
            </p>
          </>
        )
      case "discord":
        return (
          <>
            <div>
              <label className="text-text-primary mb-1.5 block text-sm font-medium">
                Bot Token
              </label>
              <input
                type="password"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
                placeholder="MTE4NzE5..."
              />
            </div>
            <div>
              <label className="text-text-primary mb-1.5 block text-sm font-medium">
                Application ID
              </label>
              <input
                type="text"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
                placeholder="118719..."
              />
            </div>
            <div>
              <label className="text-text-primary mb-1.5 block text-sm font-medium">
                Public Key
              </label>
              <input
                type="text"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
                placeholder="abc123def456..."
              />
            </div>
          </>
        )
      case "whatsapp":
        return (
          <div>
            <label className="text-text-primary mb-1.5 block text-sm font-medium">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
              placeholder="1234567890 (with country code, no +)"
            />
            <p className="text-text-muted mt-1 text-xs">
              WhatsApp uses QR code pairing via Baileys. Providing a phone number enables pairing
              code fallback.
            </p>
            {qrCode && (
              <div className="mt-4">
                <p className="text-text-primary mb-2 text-xs font-medium">
                  Scan this QR code with WhatsApp:
                </p>
                <img src={qrCode} alt="WhatsApp QR Code" className="mx-auto h-48 w-48 rounded-lg" />
              </div>
            )}
          </div>
        )
      case "widget":
        return null
      default:
        return null
    }
  }

  const telegramWebhookUrl = `${origin}/api/channels/telegram`

  if (isEditing) {
    return (
      <div className="mx-auto max-w-2xl px-8 py-8">
        <div className="mb-8">
          <h1 className="text-text-primary text-2xl font-semibold tracking-tight">Edit channel</h1>
          <p className="text-text-tertiary mt-1 text-sm">Update channel configuration.</p>
        </div>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label htmlFor="name" className="text-text-primary mb-1.5 block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
              required
            />
          </div>

          <div>
            <label
              htmlFor="is-active"
              className="text-text-primary mb-1.5 block text-sm font-medium"
            >
              Status
            </label>
            <select
              id="is-active"
              value={isActive}
              onChange={(e) => setIsActive(e.target.value)}
              className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {renderConfigForm()}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={updateChannel.isPending}
              className="bg-accent text-accent-text hover:bg-accent-strong rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {updateChannel.isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-text-secondary hover:text-text-primary text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <div className="mb-8">
        <Link
          href={`/dashboard/agents/${agentId}/channels`}
          className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1 text-xs font-medium"
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          Back to channels
        </Link>
      </div>

      <div className="border-border bg-surface rounded-xl border">
        <div className="border-border flex items-start justify-between border-b px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-text-primary text-xl font-semibold tracking-tight">
                {initial.name}
              </h1>
              <span className="bg-surface-elevated text-text-secondary rounded-full px-2.5 py-0.5 text-xs font-medium">
                {initial.type}
              </span>
              {initial.isActive === "true" ? (
                <span className="bg-success-subtle text-success-text inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
                  Active
                </span>
              ) : (
                <span className="bg-surface-elevated text-text-muted inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
                  Inactive
                </span>
              )}
            </div>
            <p className="text-text-secondary mt-1 text-sm">Connected to {agent.name}</p>
          </div>
          <div className="flex items-center gap-2">
            {initial.type !== "widget" && initial.type !== "web" && initial.type !== "api" && (
              <button
                onClick={() => {
                  handleTestConnection()
                }}
                disabled={testLoading}
                className="text-accent hover:text-accent-strong rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
              >
                {testLoading ? "Testing..." : "Test Connection"}
              </button>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="bg-accent text-accent-text hover:bg-accent-strong rounded-lg px-3 py-1.5 text-xs font-medium"
            >
              Edit
            </button>
          </div>
        </div>

        {testResult && (
          <div
            className={`border-b px-6 py-3 text-sm ${
              testResult.success
                ? "bg-success-subtle text-success-text border-success-border"
                : "bg-danger-subtle text-danger-text border-danger-border"
            }`}
          >
            {testResult.success
              ? "Connected successfully"
              : (testResult.message ?? "Connection failed")}
          </div>
        )}

        <div className="space-y-6 px-6 py-5 text-sm">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <dt className="text-text-muted text-xs font-medium uppercase tracking-wider">Type</dt>
              <dd className="text-text-primary mt-1 capitalize">{initial.type}</dd>
            </div>
            <div>
              <dt className="text-text-muted text-xs font-medium uppercase tracking-wider">
                Created
              </dt>
              <dd className="text-text-primary mt-1">
                {new Date(initial.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted text-xs font-medium uppercase tracking-wider">
                Updated
              </dt>
              <dd className="text-text-primary mt-1">
                {new Date(initial.updatedAt).toLocaleDateString()}
              </dd>
            </div>
          </div>

          {initial.type === "telegram" && (
            <div className="border-border bg-surface-elevated mt-4 rounded-lg border p-4">
              <h3 className="text-text-primary mb-2 text-sm font-medium">Webhook URL</h3>
              <p className="text-text-muted mb-2 text-xs">
                Set this as your webhook URL in Telegram Bot API:
              </p>
              <pre className="bg-bg text-text-primary overflow-x-auto rounded-lg p-3 text-xs">
                {telegramWebhookUrl}
              </pre>
            </div>
          )}
        </div>
      </div>

      {embedCode && (
        <div className="border-border bg-surface mt-6 rounded-xl border">
          <div className="border-border border-b px-6 py-4">
            <h2 className="text-text-primary text-sm font-semibold">Embed snippet</h2>
            <p className="text-text-tertiary mt-0.5 text-xs">
              Add this code to your website to enable the chat widget.
            </p>
          </div>
          <div className="px-6 py-4">
            <pre className="bg-bg overflow-x-auto rounded-lg p-4 text-xs leading-relaxed text-white">
              <code>{embedCode}</code>
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(embedCode)}
              className="text-accent hover:text-accent-strong mt-3 text-xs font-medium"
            >
              Copy to clipboard
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleDelete}
          disabled={deleteChannel.isPending}
          className="text-danger hover:text-danger-text text-xs font-medium"
        >
          {deleteChannel.isPending ? "Deleting..." : "Delete channel"}
        </button>
      </div>
    </div>
  )
}
