// @/app/lesson/components/drill-header.tsx
import { Progress } from "@/components/ui/progress"
import { useExitModal } from "@/store/use-exit-modal"
import { InfinityIcon, X } from "lucide-react"
import Image from "next/image"
import { Timer } from "@/components/timer"

type Props = {
  gems: number
  percentage: number
  hasActiveSubscription: boolean
  drillTitle?: string
  drillNumber?: number
  isTimed: boolean
  isDrillCompleted: boolean
  // isTimerPaused: boolean
}

export const DrillHeader = ({
  gems,
  percentage,
  hasActiveSubscription,
  drillTitle,
  drillNumber,
  isTimed,
  isDrillCompleted,
  // isTimerPaused,
}: Props) => {
  const { open } = useExitModal()

  return (
    <header
      className="mx-auto flex w-full max-w-[1140px] flex-col items-start gap-y-4 px-10 pt-[20px]
        lg:pt-[50px]"
    >
      {/* Conditionally render Timer or Drill Title */}
      {isTimed ? (
        <div className="flex w-full justify-center">
          <Timer isExerciseCompleted={isDrillCompleted} isTimerPaused={false} />
        </div>
      ) : (
        drillTitle && (
          <h1
            className="w-full text-center text-lg font-bold text-neutral-700 lg:text-xl
              dark:text-neutral-300"
          >
            {drillNumber ? `${drillNumber}. ${drillTitle}` : drillTitle}
          </h1>
        )
      )}
      {/* Progress Bar and Gems */}
      <div className="flex w-full items-center justify-between gap-x-7">
        <X
          onClick={open}
          className="cursor-pointer text-slate-500 transition hover:opacity-75"
        />
        <Progress value={percentage} className="flex-1" />
        <div className="flex items-center font-bold text-blue-500">
          <Image
            src={
              hasActiveSubscription
                ? "/images/icons/gems_unlimited.svg"
                : "/images/icons/gem.svg"
            }
            height={28}
            width={28}
            alt="Gem"
            className="mr-2"
          />
          {hasActiveSubscription ? (
            <InfinityIcon className="size-6 shrink-0 stroke-[3]" />
          ) : (
            gems
          )}
        </div>
      </div>
    </header>
  )
}
