import { Skeleton } from "@/components/ui/skeleton"

export default function KnowledgeBaseLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>

      <Skeleton className="h-10 w-full" />

      <div className="border-border flex gap-4 border-b pb-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-20" />
      </div>

      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  )
}
