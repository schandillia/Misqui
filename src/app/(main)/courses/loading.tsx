import { Skeleton } from "@/components/ui/skeleton"

const Loading = () => {
  return (
    <div className="mx-auto h-full max-w-[912px] px-3">
      <Skeleton className="mb-6 h-8 w-32" />

      <div className="grid grid-cols-2 gap-4 pt-6 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex h-full min-h-[217px] min-w-[200px] flex-col items-center justify-between
              rounded-3xl border-2 border-b-4 p-3 pb-6"
          >
            <div className="flex min-h-[24px] w-full items-center justify-end">
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>

            <Skeleton className="h-[70px] w-[93.33px] rounded-lg" />

            <Skeleton className="mt-3 h-6 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Loading
