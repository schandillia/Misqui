// @/app/lesson/components/exercise-header.tsx
import { Progress } from "@/components/ui/progress"
import { useExitModal } from "@/store/use-exit-modal"
import { InfinityIcon, X } from "lucide-react"
import Image from "next/image"
import { Timer } from "@/components/timer"

type Props = {
  gems: number
  percentage: number
  hasActiveSubscription: boolean
  exerciseTitle?: string
  exerciseNumber?: number
  isTimed: boolean
  isExerciseCompleted: boolean
  isTimerPaused: boolean // Add isTimerPaused to Props
}

export const ExerciseHeader = ({
  gems,
  percentage,
  hasActiveSubscription,
  exerciseTitle,
  exerciseNumber,
  isTimed,
  isExerciseCompleted,
  isTimerPaused,
}: Props) => {
  const { open } = useExitModal()

  return (
    <header
      className="mx-auto flex w-full max-w-[1140px] flex-col items-start gap-y-4 px-10 pt-[20px]
        lg:pt-[50px]"
    >
      {/* Conditionally render Timer or Exercise Title */}
      {isTimed ? (
        <div className="flex w-full justify-center">
          <Timer
            isExerciseCompleted={isExerciseCompleted}
            isTimerPaused={isTimerPaused} // Pass isTimerPaused to Timer
          />
        </div>
      ) : (
        exerciseTitle && (
          <h1
            className="w-full text-center text-lg font-bold text-neutral-700 lg:text-xl
              dark:text-neutral-300"
          >
            {exerciseNumber
              ? `${exerciseNumber}. ${exerciseTitle}`
              : exerciseTitle}
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
