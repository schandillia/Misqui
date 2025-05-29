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
    <div className="relative flex h-[102px] flex-col items-center justify-center pt-0">
      <div className="mb-2 flex h-12 items-end justify-center">
        {current ? (
          <div
            className="text-brand-500 dark:text-brand-200 relative z-10 animate-bounce rounded-full
              border-2 bg-white px-3 py-2.5 font-bold tracking-wide uppercase
              dark:border-neutral-500 dark:bg-black"
          >
            Start
            <div
              className="absolute -bottom-2.5 left-1/2 size-0 -translate-x-1/2 transform border-x-[11px]
                border-t-[10px] border-x-transparent border-t-neutral-200
                dark:border-t-neutral-500"
            />
            <div
              className="absolute -bottom-2 left-1/2 size-0 -translate-x-1/2 transform border-x-8
                border-t-8 border-x-transparent border-t-white dark:border-t-black"
            />
          </div>
        ) : (
          <div className="h-12" />
        )}
      </div>
      {children}
    </div>
  )
}
