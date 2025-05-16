import { ReactNode } from "react"

type Props = {
  index: number
  totalCount: number
  isCompleted: boolean
  children: ReactNode
  current?: boolean
}

export const ExerciseButtonWrapper = ({ children, current }: Props) => {
  return (
    <div className="relative flex flex-col items-center justify-center h-[102px] pt-0">
      <div className="h-12 mb-2 flex items-end justify-center">
        {current ? (
          <div className="px-3 py-2.5 border-2 font-bold uppercase text-brand-500 bg-white dark:text-brand-200 dark:bg-black dark:border-neutral-500 rounded-full animate-bounce tracking-wide z-10 relative">
            Start
            <div className="absolute left-1/2 -bottom-2.5 size-0 border-x-[11px] border-x-transparent border-t-[10px] border-t-neutral-200 dark:border-t-neutral-500 transform -translate-x-1/2" />
            <div className="absolute left-1/2 -bottom-2 size-0 border-x-8 border-x-transparent border-t-8 border-t-white dark:border-t-black transform -translate-x-1/2" />
          </div>
        ) : (
          <div style={{ height: "40px" }} />
        )}
      </div>
      {children}
    </div>
  )
}
