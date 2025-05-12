import { Skeleton } from "@/components/ui/skeleton"

const Loading = () => {
  return (
    <div className="h-full max-w-[912px] px-3 mx-auto">
      <Skeleton className="w-32 h-8 mb-6" />

      <div className="pt-6 grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-full border-2 rounded-2xl border-b-4 flex flex-col items-center justify-between p-3 pb-6 min-h-[217px] min-w-[200px]"
          >
            <div className="w-full min-h-[24px] justify-end flex items-center">
              <Skeleton className="w-6 h-6 rounded-full" />
            </div>

            <Skeleton className="w-[93.33px] h-[70px] rounded-lg" />

            <Skeleton className="w-24 h-6 mt-3" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Loading
