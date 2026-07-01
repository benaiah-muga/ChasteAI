export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="bg-surface-elevated h-6 w-32 animate-pulse rounded" />
        <div className="bg-surface-elevated mt-1 h-4 w-56 animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-border bg-surface rounded-xl border p-4">
            <div className="bg-surface-elevated h-4 w-20 animate-pulse rounded" />
            <div className="bg-surface-elevated mt-3 h-7 w-28 animate-pulse rounded" />
            <div className="bg-surface-elevated mt-2 h-3 w-16 animate-pulse rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="border-border bg-surface rounded-xl border p-4 lg:col-span-2">
          <div className="bg-surface-elevated h-5 w-36 animate-pulse rounded" />
          <div className="bg-surface-elevated mt-6 h-48 animate-pulse rounded" />
        </div>
        <div className="border-border bg-surface rounded-xl border p-4">
          <div className="bg-surface-elevated h-5 w-24 animate-pulse rounded" />
          <div className="bg-surface-elevated mt-6 h-32 animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
}
