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
        {/* Missions list skeleton */}
        <ul className="w-full">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-center w-full p-4 gap-x-4 border-t-2"
            >
              <Skeleton className="w-[60px] h-[60px]" />
              <div className="flex flex-col w-full gap-y-2">
                <Skeleton className="w-48 h-6" />
                <Skeleton className="w-full h-3" />
              </div>
            </div>
          ))}
        </ul>
      </div>
    </div>
  </div>
)

export default Loading
