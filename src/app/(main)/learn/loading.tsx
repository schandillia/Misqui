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
        <div className="uppercase pt-6 text-xs font-bold text-muted-foreground flex flex-wrap justify-between gap-x-4 gap-y-2 border-t border-neutral-200 dark:border-neutral-800 mt-6 px-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="w-16 h-4 mb-2" />
          ))}
        </div>
      </div>
    </div>
    {/* Main feed skeleton */}
    <div className="flex-1 relative top-0 pb-10">
      {/* Header skeleton */}
      <div className="bg-white dark:bg-black sticky top-0 pb-3 lg:mt-[-28px] lg:pt-[28px] flex items-center justify-between border-b-2 mb-5 text-neutral-400 lg:z-50">
        <Skeleton className="w-10 h-8" />
        <Skeleton className="w-40 h-8" />
        <Skeleton className="w-10 h-8" />
      </div>
      {/* Units skeleton */}
      {[...Array(2)].map((_, unitIdx) => (
        <div key={unitIdx} className="mb-10">
          {/* UnitBanner skeleton */}
          <div className="w-full rounded-2xl bg-muted p-5 flex items-center justify-between mb-8">
            <div className="space-y-2.5">
              <Skeleton className="w-32 h-8 mb-2" />
              <Skeleton className="w-64 h-6" />
            </div>
            <Skeleton className="w-24 h-10" />
          </div>
          {/* Exercise buttons skeleton */}
          <div className="mt-12">
            <div className="flex flex-wrap gap-y-16 justify-between w-full">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-1/2 sm:w-1/4 xl:w-1/6 flex justify-center h-[102px]"
                >
                  <Skeleton className="w-[70px] h-[70px] rounded-3xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default Loading
