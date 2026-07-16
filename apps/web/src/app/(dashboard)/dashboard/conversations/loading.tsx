import { Skeleton } from "@/components/ui/skeleton"

export default function ConversationsLoading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-0 lg:flex-row">
      <div className="border-border bg-surface w-full border-b lg:w-[360px] lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="border-border flex flex-col gap-4 border-b p-4">
          <div className="space-y-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-9" />
        </div>
        <div className="space-y-1 p-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>
      <div className="hidden flex-1 items-center justify-center lg:flex">
        <div className="text-center">
          <Skeleton className="mx-auto h-12 w-12 rounded-full" />
          <Skeleton className="mx-auto mt-4 h-5 w-36" />
          <Skeleton className="mx-auto mt-2 h-4 w-52" />
        </div>
      </div>
    </div>
  )
}
