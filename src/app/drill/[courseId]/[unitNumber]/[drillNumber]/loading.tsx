import { Skeleton } from "@/components/ui/skeleton"

const Loading = () => (
  <div className="flex min-h-screen flex-col">
    {/* Header skeleton */}
    <div
      className="mx-auto flex w-full max-w-[1140px] items-center justify-between gap-x-7 px-10
        pt-[20px] lg:pt-[50px]"
    >
      <Skeleton className="size-8 rounded-full" />
      <Skeleton className="h-4 w-1/2 rounded-full" /> {/* Progress bar */}
      <div className="flex items-center gap-2">
        <Skeleton className="size-7 rounded-full" />
        <Skeleton className="h-7 w-10 rounded" />
      </div>
    </div>
    {/* Main content */}
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      {/* Question bubble skeleton */}
      <div className="mb-8 flex w-full max-w-xl items-center gap-x-4">
        <Skeleton className="hidden h-[60px] w-[60px] rounded-full lg:block" />
        <Skeleton className="block h-[40px] w-[40px] rounded-full lg:hidden" />
        <Skeleton className="h-12 w-full rounded-3xl" />
      </div>
      {/* Options skeleton */}
      <div className="grid w-full max-w-xl grid-cols-1 gap-6 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col">
            <Skeleton className="h-[72px] w-full rounded-3xl" />
          </div>
        ))}
      </div>
    </div>
    {/* Footer skeleton */}
    <div className="flex w-full items-center justify-end border-t-2 px-6 py-6 lg:px-10">
      <Skeleton className="h-12 w-32 rounded-3xl" />
    </div>
  </div>
)

export default Loading
