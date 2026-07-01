export default function ChannelsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="bg-surface-elevated h-6 w-28 animate-pulse rounded" />
          <div className="bg-surface-elevated mt-1 h-4 w-52 animate-pulse rounded" />
        </div>
        <div className="bg-surface-elevated h-9 w-32 animate-pulse rounded-lg" />
      </div>
      <div className="bg-surface-elevated h-9 animate-pulse rounded-lg" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-border bg-surface flex items-center gap-4 rounded-xl border p-4"
          >
            <div className="bg-surface-elevated h-10 w-10 animate-pulse rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="bg-surface-elevated h-4 w-40 animate-pulse rounded" />
              <div className="bg-surface-elevated h-3 w-56 animate-pulse rounded" />
            </div>
            <div className="bg-surface-elevated h-8 w-20 animate-pulse rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
