import { Skeleton } from "@/components/ui/skeleton"

const Loading = () => (
  <div className="flex flex-row-reverse gap-[48px] px-6">
    {/* Sidebar skeleton */}
    <div className="hidden lg:block w-[368px] sticky self-end bottom-6">
      <div className="min-h-[calc(100vh-48px)] sticky top-6 flex flex-col justify-between">
        <div className="flex flex-col gap-y-4">
          {/* UserProgress skeleton */}
          <div className="flex items-center justify-between gap-x-2 w-full mb-4">
            <Skeleton className="w-8 h-8" />
            <Skeleton className="w-16 h-8" />
            <Skeleton className="w-16 h-8" />
            <Skeleton className="w-12 h-8" />
          </div>
          {/* Promo skeleton */}
          <div className="rounded-xl p-4 border-2 space-y-4">
            <div className="flex items-center gap-x-2 mb-2">
              <Skeleton className="w-6 h-6" />
              <Skeleton className="w-32 h-6" />
            </div>
            <Skeleton className="w-40 h-4 mb-2" />
            <Skeleton className="w-full h-10" />
          </div>
          {/* Missions skeleton */}
          <div className="rounded-xl p-4 border-2 space-y-4 mt-4">
            <Skeleton className="w-24 h-6 mb-2" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center w-full pb-4 gap-x-3">
                <Skeleton className="w-10 h-10" />
                <div className="flex flex-col w-full gap-y-2">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-full h-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    {/* Main content skeleton */}
    <div className="flex-1">
      <div className="w-full flex flex-col items-center">
        {/* Header skeleton */}
        <div className="flex flex-col items-center gap-y-4 mb-8">
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="w-32 h-8" />
          <Skeleton className="w-64 h-4" />
        </div>
        {/* Leaderboard list skeleton */}
        <div className="w-full">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="flex items-center w-full p-2 px-4 rounded-2xl mb-2"
            >
              {/* Rank skeleton */}
              <div className="w-8 flex justify-center">
                {i < 3 ? (
                  <Skeleton className="w-8 h-8 rounded-full" />
                ) : (
                  <Skeleton className="w-6 h-6" />
                )}
              </div>
              {/* Avatar skeleton */}
              <Skeleton className="size-12 rounded-full ml-5 mr-6" />
              {/* Name skeleton */}
              <Skeleton className="w-32 h-6 flex-1" />
              {/* Points skeleton */}
              <Skeleton className="w-20 h-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default Loading
