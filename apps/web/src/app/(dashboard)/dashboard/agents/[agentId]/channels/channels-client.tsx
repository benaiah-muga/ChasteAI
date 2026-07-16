"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/trpc/react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

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

function ChannelIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    web: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
        />
      </svg>
    ),
    widget: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01C3.02 15.087 5.368 17 8.25 17c.635 0 1.25-.082 1.836-.237M5.25 18L3 19.5m15.75-4.5c.757 0 1.483-.158 2.14-.44M17.25 15l3 1.5M5.25 15l-3 1.5"
        />
      </svg>
    ),
    api: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
        />
      </svg>
    ),
    telegram: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
        />
      </svg>
    ),
  }

  return (
    <div className="text-accent bg-accent-subtle flex h-10 w-10 items-center justify-center rounded-lg">
      {icons[type] ?? icons.web}
    </div>
  )
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function ChannelsClient({
  channels: initial,
  agentId,
}: {
  channels: Channel[]
  agentId: string
}) {
  const router = useRouter()
  const utils = api.useUtils()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const deleteChannel = api.channel.delete.useMutation({
    onSuccess: () => {
      utils.channel.list.invalidate({ agentId })
      router.refresh()
      setDeleteTarget(null)
    },
  })

  function handleDeleteConfirm() {
    if (deleteTarget) {
      deleteChannel.mutate({ id: deleteTarget.id })
    }
  }

  return (
    <div className="space-y-3">
      {initial.length === 0 ? (
        <div className="border-border bg-surface flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-16">
          <div className="bg-accent-subtle mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <svg
              className="text-accent h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
              />
            </svg>
          </div>
          <h3 className="text-text-primary text-base font-semibold">No channels yet</h3>
          <p className="text-text-secondary mt-1 text-sm">
            Create a channel to connect this agent to conversations.
          </p>
          <Link
            href={`/dashboard/agents/${agentId}/channels/new`}
            className="bg-accent text-accent-text hover:bg-accent-strong mt-4 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create channel
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {initial.map((channel) => (
            <div
              key={channel.id}
              className="bg-surface border-border group flex items-center gap-4 rounded-lg border p-4 transition-shadow hover:shadow-sm"
            >
              <ChannelIcon type={channel.type} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/agents/${agentId}/channels/${channel.id}`}
                    className="text-text-primary hover:text-accent text-sm font-medium"
                  >
                    {channel.name}
                  </Link>
                  <span className="bg-surface-elevated text-text-secondary rounded-full px-2 py-0.5 text-xs font-medium">
                    {channel.type}
                  </span>
                  {channel.isActive === "true" ? (
                    <span className="text-success-text inline-flex items-center gap-1 text-xs">
                      <span className="bg-success-text inline-block h-1.5 w-1.5 rounded-full" />
                      Active
                    </span>
                  ) : (
                    <span className="text-text-muted inline-flex items-center gap-1 text-xs">
                      <span className="bg-text-muted inline-block h-1.5 w-1.5 rounded-full" />
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-text-muted mt-0.5 text-xs">
                  Updated {timeAgo(channel.updatedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                <Link
                  href={`/dashboard/agents/${agentId}/channels/${channel.id}`}
                  className="text-accent hover:text-accent-strong text-xs font-medium"
                >
                  Configure
                </Link>
                <span className="text-text-muted">·</span>
                <button
                  onClick={() => setDeleteTarget({ id: channel.id, name: channel.name })}
                  disabled={deleteChannel.isPending}
                  className="text-danger hover:text-danger-text text-xs font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.name ?? "channel"}"?`}
        description="This will permanently remove this channel. Any connected conversations will be lost."
        confirmText={deleteTarget?.name ?? "channel"}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteChannel.isPending}
      />
    </div>
  )
}
