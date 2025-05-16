import { Skeleton } from "@/components/ui/skeleton"

const ExerciseSkeleton = () => (
  <div className="flex flex-col min-h-screen">
    {/* Header skeleton */}
    <div className="lg:pt-[50px] pt-[20px] px-10 flex gap-x-7 items-center justify-between max-w-[1140px] mx-auto w-full mb-8">
      <Skeleton className="w-8 h-8 rounded-full" />
      <Skeleton className="h-4 w-1/2 rounded-full" /> {/* Progress bar */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-7 h-7 rounded-full" />
        <Skeleton className="w-10 h-7 rounded" />
      </div>
    </div>
    {/* Main content */}
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      {/* Question bubble skeleton */}
      <div className="flex items-center gap-x-4 mb-8 w-full max-w-xl">
        <Skeleton className="hidden lg:block w-[60px] h-[60px] rounded-full" />
        <Skeleton className="block lg:hidden w-[40px] h-[40px] rounded-full" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      {/* Options skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col">
            <Skeleton className="h-[72px] rounded-3xl w-full" />
          </div>
        ))}
      </div>
    </div>
    {/* Footer skeleton */}
    <div className="w-full flex justify-end items-center border-t-2 pt-6 pb-8 mt-auto px-6 lg:px-10">
      <Skeleton className="w-32 h-12 rounded-lg" />
    </div>
  </div>
)

export default ExerciseSkeleton
