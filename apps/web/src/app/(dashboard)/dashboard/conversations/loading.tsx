export default function ConversationsLoading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-0 lg:flex-row">
      <div className="border-border bg-surface w-full border-b lg:w-[360px] lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="border-border flex flex-col gap-4 border-b p-4">
          <div className="space-y-1">
            <div className="bg-surface-elevated h-6 w-40 animate-pulse rounded" />
            <div className="bg-surface-elevated h-3 w-16 animate-pulse rounded" />
          </div>
          <div className="bg-surface-elevated h-9 animate-pulse rounded-lg" />
        </div>
        <div className="space-y-1 p-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <div className="bg-surface-elevated h-8 w-8 animate-pulse rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="bg-surface-elevated h-4 w-32 animate-pulse rounded" />
                <div className="bg-surface-elevated h-3 w-24 animate-pulse rounded" />
              </div>
              <div className="bg-surface-elevated h-3 w-10 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="hidden flex-1 items-center justify-center lg:flex">
        <div className="text-center">
          <div className="bg-surface-elevated mx-auto h-12 w-12 animate-pulse rounded-full" />
          <div className="bg-surface-elevated mx-auto mt-4 h-5 w-36 animate-pulse rounded" />
          <div className="bg-surface-elevated mx-auto mt-2 h-4 w-52 animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
}
