import { Skeleton } from "@/components/ui/skeleton"

const Loading = () => (
  <div className="flex flex-row-reverse gap-[48px] px-6">
    {/* Sidebar skeleton */}
    <div className="sticky bottom-6 hidden w-[368px] self-end lg:block">
      <div className="sticky top-6 flex min-h-[calc(100vh-48px)] flex-col justify-between">
        <div className="flex flex-col gap-y-4">
          {/* UserProgress skeleton */}
          <div className="mb-4 flex w-full items-center justify-between gap-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-12" />
          </div>
          {/* Promo skeleton */}
          <div className="space-y-4 rounded-3xl border-2 p-4">
            <div className="mb-2 flex items-center gap-x-2">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="mb-2 h-4 w-40" />
            <Skeleton className="h-10 w-full" />
          </div>
          {/* Missions skeleton */}
          <div className="mt-4 space-y-4 rounded-3xl border-2 p-4">
            <Skeleton className="mb-2 h-6 w-24" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex w-full items-center gap-x-3 pb-4">
                <Skeleton className="h-10 w-10" />
                <div className="flex w-full flex-col gap-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    {/* Main content skeleton */}
    <div className="flex-1">
      <div className="flex w-full flex-col items-center">
        {/* Header skeleton */}
        <div className="mb-8 flex flex-col items-center gap-y-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        {/* Leaderboard list skeleton */}
        <div className="w-full">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="mb-2 flex w-full items-center rounded-3xl p-2 px-4"
            >
              {/* Rank skeleton */}
              <div className="flex w-8 justify-center">
                {i < 3 ? (
                  <Skeleton className="h-8 w-8 rounded-full" />
                ) : (
                  <Skeleton className="h-6 w-6" />
                )}
              </div>
              {/* Avatar skeleton */}
              <Skeleton className="mr-6 ml-5 size-12 rounded-full" />
              {/* Name skeleton */}
              <Skeleton className="h-6 w-32 flex-1" />
              {/* Points skeleton */}
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default Loading
