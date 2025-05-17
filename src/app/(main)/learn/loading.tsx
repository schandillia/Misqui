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
        <div className="text-muted-foreground mt-6 flex flex-wrap justify-between gap-x-4 gap-y-2 border-t border-neutral-200 px-2 pt-6 text-xs font-bold uppercase dark:border-neutral-800">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="mb-2 h-4 w-16" />
          ))}
        </div>
      </div>
    </div>
    {/* Main feed skeleton */}
    <div className="relative top-0 flex-1 pb-10">
      {/* Header skeleton */}
      <div className="sticky top-0 mb-5 flex items-center justify-between border-b-2 bg-white pb-3 text-neutral-400 lg:z-50 lg:mt-[-28px] lg:pt-[28px] dark:bg-black">
        <Skeleton className="h-8 w-10" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-10" />
      </div>
      {/* Lessons skeleton */}
      {[...Array(2)].map((_, lessonIdx) => (
        <div key={lessonIdx} className="mb-10">
          {/* LessonBanner skeleton */}
          <div className="bg-muted mb-8 flex w-full items-center justify-between rounded-3xl p-5">
            <div className="space-y-2.5">
              <Skeleton className="mb-2 h-8 w-32" />
              <Skeleton className="h-6 w-64" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          {/* Exercise buttons skeleton */}
          <div className="mt-12">
            <div className="flex w-full flex-wrap justify-between gap-y-16">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex h-[102px] w-1/2 justify-center sm:w-1/4 xl:w-1/6"
                >
                  <Skeleton className="h-[70px] w-[70px] rounded-3xl" />
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
