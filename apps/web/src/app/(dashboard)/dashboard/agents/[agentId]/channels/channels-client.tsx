"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/trpc/react"

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
    slack: (
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
          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
        />
      </svg>
    ),
    discord: (
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
          d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
        />
      </svg>
    ),
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef2ff] text-[#6366f1]">
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
  const deleteChannel = api.channel.delete.useMutation({
    onSuccess: () => {
      utils.channel.list.invalidate({ agentId })
      router.refresh()
    },
  })

  function handleDelete(id: string, name: string) {
    if (confirm(`Delete channel "${name}"?`)) {
      deleteChannel.mutate({ id })
    }
  }

  return (
    <div className="space-y-3">
      {initial.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#e2e8f0] bg-white px-6 py-16">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2ff]">
            <svg
              className="h-6 w-6 text-[#6366f1]"
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
          <h3 className="text-base font-semibold text-[#0f172a]">No channels yet</h3>
          <p className="mt-1 text-sm text-[#64748b]">
            Create a channel to connect this agent to conversations.
          </p>
          <Link
            href={`/dashboard/agents/${agentId}/channels/new`}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4f46e5]"
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
        initial.map((channel) => (
          <div
            key={channel.id}
            className="group flex items-center gap-4 rounded-xl border border-[#e2e8f0] bg-white p-4 transition-shadow hover:shadow-sm"
          >
            <ChannelIcon type={channel.type} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/agents/${agentId}/channels/${channel.id}`}
                  className="text-sm font-medium text-[#0f172a] hover:text-[#6366f1]"
                >
                  {channel.name}
                </Link>
                <span className="rounded-full bg-[#f1f5f9] px-2 py-0.5 text-xs font-medium text-[#64748b]">
                  {channel.type}
                </span>
                {channel.isActive === "true" ? (
                  <span className="inline-flex items-center gap-1 text-xs text-[#16a34a]">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-[#94a3b8]">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#94a3b8]" />
                    Inactive
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-[#94a3b8]">Updated {timeAgo(channel.updatedAt)}</p>
            </div>
            <div className="flex items-center gap-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
              <Link
                href={`/dashboard/agents/${agentId}/channels/${channel.id}`}
                className="text-xs font-medium text-[#6366f1] hover:text-[#4f46e5]"
              >
                Configure
              </Link>
              <span className="text-[#e2e8f0]">·</span>
              <button
                onClick={() => handleDelete(channel.id, channel.name)}
                disabled={deleteChannel.isPending}
                className="text-xs font-medium text-[#ef4444] hover:text-[#dc2626]"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
