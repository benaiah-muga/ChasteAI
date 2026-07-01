"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/trpc/react"
import {
  Globe,
  Bot,
  Cpu,
  Send,
  MessageCircle,
  Hash,
  Gamepad2,
  CheckCircle2,
  Settings2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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

type Agent = {
  id: string
  name: string
}

const supportedTypes = [
  {
    value: "widget",
    label: "Widget",
    description: "Embeddable chat widget for your website",
    icon: Bot,
  },
  { value: "web", label: "Web", description: "Chat interface within the dashboard", icon: Globe },
  { value: "api", label: "API", description: "Programmatic access via REST API", icon: Cpu },
  { value: "slack", label: "Slack", description: "Connect to a Slack workspace", icon: Hash },
  {
    value: "discord",
    label: "Discord",
    description: "Connect to a Discord server",
    icon: Gamepad2,
  },
  { value: "telegram", label: "Telegram", description: "Connect via Telegram Bot API", icon: Send },
  {
    value: "whatsapp",
    label: "WhatsApp",
    description: "Connect via WhatsApp (Baileys QR pairing)",
    icon: MessageCircle,
  },
]

type Props = {
  channels: (Channel & { agentName?: string })[]
  agents: Agent[]
}

function getTypeStatus(channels: (Channel & { agentName?: string })[], type: string) {
  const ofType = channels.filter((c) => c.type === type)
  const active = ofType.filter((c) => c.isActive === "true")
  if (active.length > 0) return { label: `${active.length} connected`, variant: "success" as const }
  if (ofType.length > 0) return { label: `${ofType.length} inactive`, variant: "neutral" as const }
  return { label: "Not configured", variant: "muted" as const }
}

const configFields: Record<
  string,
  { key: string; label: string; type: "text" | "password" | "tel"; placeholder: string }[]
> = {
  telegram: [
    {
      key: "botToken",
      label: "Bot Token",
      type: "password",
      placeholder: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
    },
  ],
  slack: [
    { key: "botToken", label: "Bot Token", type: "password", placeholder: "xoxb-..." },
    { key: "appToken", label: "App Token", type: "password", placeholder: "xapp-..." },
    {
      key: "signingSecret",
      label: "Signing Secret",
      type: "password",
      placeholder: "abc123def456...",
    },
  ],
  discord: [
    { key: "botToken", label: "Bot Token", type: "password", placeholder: "MTE4NzE5..." },
    { key: "applicationId", label: "Application ID", type: "text", placeholder: "118719..." },
    { key: "publicKey", label: "Public Key", type: "text", placeholder: "abc123def456..." },
  ],
  whatsapp: [
    {
      key: "phoneNumber",
      label: "Phone Number",
      type: "tel",
      placeholder: "1234567890 (with country code, no +)",
    },
  ],
}

export function ChannelsClient({ channels, agents }: Props) {
  const router = useRouter()
  const utils = api.useUtils()
  const [configuring, setConfiguring] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [selectedAgent, setSelectedAgent] = useState("")
  const [config, setConfig] = useState<Record<string, string>>({})
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null)

  const createChannel = api.channel.create.useMutation({
    onSuccess: () => {
      utils.channel.list.invalidate()
      setConfiguring(null)
      setName("")
      setConfig({})
      setTestResult(null)
      router.refresh()
    },
  })

  function handleConfigure(type: string) {
    setConfiguring(type)
    setName(`${supportedTypes.find((t) => t.value === type)?.label ?? type} Channel`)
    setSelectedAgent(agents[0]?.id ?? "")
    setConfig({})
    setTestResult(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !selectedAgent || !configuring) return
    createChannel.mutate({
      agentId: selectedAgent,
      name,
      type: configuring as "widget" | "web" | "api" | "slack" | "discord" | "telegram" | "whatsapp",
      isActive: "true",
      config: config as Record<string, unknown>,
    })
  }

  const testConnection = api.channel.testProviderConfig.useMutation({
    onSuccess: (result) => setTestResult(result),
    onError: (error) => setTestResult({ success: false, message: error.message }),
  })

  async function handleTestConnection() {
    if (!configuring) return
    setTestResult(null)

    const fields = configFields[configuring] ?? []
    const hasRequired = fields.every((f) => config[f.key])
    if (!hasRequired) {
      setTestResult({ success: false, message: "Fill in all required fields first" })
      return
    }

    testConnection.mutate({
      type: configuring as "web" | "widget" | "api" | "slack" | "discord" | "telegram" | "whatsapp",
      config: config as Record<string, unknown>,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-text-primary text-lg font-semibold tracking-tight">Channels</h1>
        <p className="text-text-tertiary mt-0.5 text-xs">
          Browse and configure communication channels for your agents
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {supportedTypes.map((type) => {
          const Icon = type.icon
          const status = getTypeStatus(channels, type.value)
          const isConfiguring = configuring === type.value

          return (
            <div
              key={type.value}
              className={`border-border bg-surface rounded-xl border transition-all ${
                isConfiguring ? "ring-accent ring-2" : "hover:border-border-hover"
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="bg-accent-subtle text-accent flex h-10 w-10 items-center justify-center rounded-lg">
                    <Icon className="h-5 w-5" />
                  </div>
                  {status.label === "Not configured" ? (
                    <Badge variant="muted">{status.label}</Badge>
                  ) : (
                    <Badge variant={status.variant}>{status.label}</Badge>
                  )}
                </div>
                <h3 className="text-text-primary mt-4 text-sm font-semibold">{type.label}</h3>
                <p className="text-text-tertiary mt-1 text-xs leading-relaxed">
                  {type.description}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  {isConfiguring ? (
                    <Button variant="secondary" size="sm" onClick={() => setConfiguring(null)}>
                      <X className="mr-1 h-3.5 w-3.5" />
                      Cancel
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handleConfigure(type.value)}>
                      <Settings2 className="mr-1 h-3.5 w-3.5" />
                      Configure
                    </Button>
                  )}
                </div>
              </div>

              {isConfiguring && (
                <div className="border-border border-t">
                  <form onSubmit={handleSave} className="space-y-4 p-5">
                    <div>
                      <label className="text-text-primary mb-1 block text-xs font-medium">
                        Agent
                      </label>
                      <select
                        value={selectedAgent}
                        onChange={(e) => setSelectedAgent(e.target.value)}
                        className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
                        required
                      >
                        {agents.length === 0 && <option value="">No agents available</option>}
                        {agents.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-text-primary mb-1 block text-xs font-medium">
                        Channel name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
                        required
                      />
                    </div>

                    {(configFields[type.value] ?? []).map((field) => (
                      <div key={field.key}>
                        <label className="text-text-primary mb-1 block text-xs font-medium">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          value={config[field.key] ?? ""}
                          onChange={(e) =>
                            setConfig((prev) => ({ ...prev, [field.key]: e.target.value }))
                          }
                          className="border-border bg-bg text-text-primary focus:border-accent focus:ring-accent block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
                          placeholder={field.placeholder}
                        />
                      </div>
                    ))}

                    {testResult && (
                      <div
                        className={`rounded-lg px-3 py-2 text-xs ${
                          testResult.success
                            ? "bg-success-subtle text-success-text"
                            : "bg-danger-subtle text-danger-text"
                        }`}
                      >
                        {testResult.success
                          ? "Connected successfully"
                          : (testResult.message ?? "Connection failed")}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={createChannel.isPending || agents.length === 0}
                      >
                        {createChannel.isPending ? "Saving..." : "Save Channel"}
                      </Button>
                      {(configFields[type.value] ?? []).length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleTestConnection}
                        >
                          Test Connection
                        </Button>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {channels.length > 0 && (
        <div className="border-border bg-surface rounded-xl border">
          <div className="border-border border-b px-5 py-3">
            <h2 className="text-text-primary text-sm font-semibold">All configured channels</h2>
          </div>
          <div className="divide-border divide-y">
            {channels.map((channel) => {
              const typeDef = supportedTypes.find((t) => t.value === channel.type)
              const Icon = typeDef?.icon ?? Bot
              return (
                <div key={channel.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="bg-accent-subtle text-accent flex h-8 w-8 items-center justify-center rounded-lg">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-text-primary text-sm font-medium">{channel.name}</span>
                      <Badge variant="neutral" className="text-[10px]">
                        {channel.type}
                      </Badge>
                      {channel.agentName && (
                        <span className="text-text-muted hidden truncate text-xs sm:inline">
                          via {channel.agentName}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`flex items-center gap-1 text-xs ${
                      channel.isActive === "true" ? "text-success-text" : "text-text-muted"
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {channel.isActive === "true" ? "Active" : "Inactive"}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
