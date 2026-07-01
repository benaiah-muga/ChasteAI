export default function WorkspacesLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="bg-surface-elevated h-6 w-28 animate-pulse rounded" />
          <div className="bg-surface-elevated mt-1 h-4 w-48 animate-pulse rounded" />
        </div>
        <div className="bg-surface-elevated h-9 w-32 animate-pulse rounded-lg" />
      </div>
      <div className="bg-surface-elevated h-9 w-64 animate-pulse rounded-lg" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-border bg-surface rounded-xl border p-5">
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-2">
                <div className="bg-surface-elevated h-4 w-32 animate-pulse rounded" />
                <div className="bg-surface-elevated h-3 w-20 animate-pulse rounded" />
              </div>
              <div className="bg-surface-elevated h-5 w-16 animate-pulse rounded-full" />
            </div>
            <div className="bg-surface-elevated mt-4 h-3 w-full animate-pulse rounded" />
            <div className="bg-surface-elevated mt-2 h-3 w-3/4 animate-pulse rounded" />
            <div className="bg-surface-elevated mt-6 h-3 w-24 animate-pulse rounded" />
            <div className="border-border mt-4 border-t pt-3">
              <div className="bg-surface-elevated h-3 w-16 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
