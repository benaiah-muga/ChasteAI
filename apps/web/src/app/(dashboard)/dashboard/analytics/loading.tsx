import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="space-y-1">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-border bg-surface rounded-lg border p-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-3 h-7 w-28" />
            <Skeleton className="mt-2 h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="border-border bg-surface rounded-lg border p-4 lg:col-span-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-6 h-48" />
        </div>
        <div className="border-border bg-surface rounded-lg border p-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-6 h-32" />
        </div>
      </div>
    </div>
  )
}
