"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Copy, Check, ExternalLink, MessageCircle, X } from "lucide-react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Agent = {
  id: string
  name: string
  description: string | null
}

type WidgetChannel = {
  id: string
  type: string
  name: string
  config: Record<string, unknown> | null
}

function getEmbedCode(channelId: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : ""
  return `<script>
  (function(w,d,s,o,f){
    w['ChasteAI']=f;w[f]=w[f]||function(){(w[f].q=w[f].q||[]).push(arguments)};
    var g=d.createElement(s),r=d.getElementsByTagName(s)[0];
    g.async=1;g.src=o;r.parentNode.insertBefore(g,r);
  })(window,document,'script','${origin}/widget/embed.js','chasteai');
  chasteai('init', '${channelId}');
</script>`
}

export function PreviewClient({
  agent,
  widgetChannel,
}: {
  agent: Agent
  widgetChannel: WidgetChannel
}) {
  const router = useRouter()
  const utils = api.useUtils()
  const [copied, setCopied] = useState(false)
  const [widgetOpen, setWidgetOpen] = useState(true)
  const [saved, setSaved] = useState(false)
  const config = (widgetChannel.config ?? {}) as Record<string, string>
  const [color, setColor] = useState(config.color ?? "#6366f1")
  const [title, setTitle] = useState(config.title ?? "Chat")
  const [greeting, setGreeting] = useState(config.greeting ?? "")

  const embedCode = typeof window !== "undefined" ? getEmbedCode(widgetChannel.id) : ""

  const updateChannel = api.channel.update.useMutation({
    onSuccess: () => {
      utils.channel.list.invalidate({ agentId: agent.id })
      utils.channel.getById.invalidate({ id: widgetChannel.id })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    },
  })

  function handleSaveConfig() {
    updateChannel.mutate({
      id: widgetChannel.id,
      data: {
        config: { color, title, greeting },
      },
    })
  }

  const handleMessage = useCallback((e: MessageEvent) => {
    if (e.data?.type === "chasteai-close") {
      setWidgetOpen(false)
    }
  }, [])

  useEffect(() => {
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [handleMessage])

  function handleCopy() {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const widgetSrc = `/widget/channel/${widgetChannel.id}?color=${encodeURIComponent(color)}&title=${encodeURIComponent(title)}&greeting=${encodeURIComponent(greeting)}&agentName=${encodeURIComponent(agent.name)}&test=true`

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/agents/${agent.id}`}
            className="text-text-tertiary hover:text-text-secondary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-text-primary font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
              Widget Preview
            </h1>
            <p className="text-text-tertiary mt-0.5 text-sm">
              Testing <span className="text-text-secondary font-medium">{agent.name}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="warning">Test Mode</Badge>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
            {copied ? "Copied!" : "Copy Embed"}
          </Button>
          <Link href={`/dashboard/agents/${agent.id}/channels/${widgetChannel.id}`}>
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-1 h-3 w-3" />
              Configure
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div
          className="border-border bg-surface relative flex-1 overflow-hidden rounded-lg border"
          style={{ height: "calc(100vh - 220px)" }}
        >
          <div className="absolute inset-0">
            <div className="bg-bg h-full overflow-y-auto">
              <header className="border-border border-b px-8 py-5">
                <div className="mx-auto max-w-4xl">
                  <p className="text-text-primary text-lg font-semibold">Your Website</p>
                  <p className="text-text-muted text-sm">
                    This is how the widget will appear to your visitors
                  </p>
                </div>
              </header>
              <main className="mx-auto max-w-4xl px-8 py-12">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <div className="bg-surface-active h-8 w-48 rounded" />
                    <div className="bg-surface-active h-4 w-full max-w-lg rounded" />
                    <div className="bg-surface-active h-4 w-full max-w-md rounded" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border-border bg-surface rounded-lg border p-4">
                        <div className="bg-surface-active mb-3 h-4 w-20 rounded" />
                        <div className="bg-surface-active h-3 w-full rounded" />
                        <div className="bg-surface-active mt-1 h-3 w-3/4 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="bg-surface-active h-6 w-32 rounded" />
                    <div className="bg-surface-active h-4 w-full rounded" />
                    <div className="bg-surface-active h-4 w-full rounded" />
                    <div className="bg-surface-active h-4 w-2/3 rounded" />
                  </div>
                </div>
              </main>
            </div>

            {widgetOpen && (
              <iframe
                key={widgetSrc}
                src={widgetSrc}
                style={{
                  position: "fixed",
                  bottom: 80,
                  right: 20,
                  width: 380,
                  height: 560,
                  border: "none",
                  borderRadius: 12,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                  zIndex: 9999,
                }}
                title="Widget Preview"
              />
            )}
            <button
              onClick={() => setWidgetOpen((prev) => !prev)}
              style={{
                position: "fixed",
                bottom: 20,
                right: 20,
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: color,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10000,
                transition: "transform 0.2s",
              }}
              aria-label={widgetOpen ? "Close chat widget" : "Open chat widget"}
            >
              {widgetOpen ? (
                <X width="24" height="24" color="white" />
              ) : (
                <MessageCircle width="24" height="24" color="white" />
              )}
            </button>
          </div>
        </div>

        <div className="w-full shrink-0 space-y-4 lg:w-72">
          <div className="bg-surface border-border space-y-4 rounded-lg border p-4">
            <h3 className="text-text-primary text-sm font-medium">Customize Appearance</h3>
            <div>
              <label className="text-text-secondary mb-1.5 block text-xs font-medium">
                Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded border-0"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="border-border bg-bg text-text-primary flex-1 rounded-md border px-2 py-1 font-mono text-xs"
                />
              </div>
            </div>
            <div>
              <label className="text-text-secondary mb-1.5 block text-xs font-medium">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-border bg-bg text-text-primary w-full rounded-md border px-2 py-1 text-xs"
              />
            </div>
            <div>
              <label className="text-text-secondary mb-1.5 block text-xs font-medium">
                Greeting
              </label>
              <input
                type="text"
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                className="border-border bg-bg text-text-primary w-full rounded-md border px-2 py-1 text-xs"
                placeholder="Have a question?"
              />
            </div>
            <Button
              size="sm"
              className="w-full"
              onClick={handleSaveConfig}
              disabled={updateChannel.isPending || saved}
            >
              {saved ? "Saved!" : updateChannel.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
          <p className="text-text-muted text-xs">
            Changes preview instantly. Click Save to make them permanent.
          </p>
        </div>
      </div>
    </div>
  )
}
