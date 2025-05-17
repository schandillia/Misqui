// @/app/exercise/exercise-header.tsx
import { Progress } from "@/components/ui/progress"
import { useExitModal } from "@/store/use-exit-modal"
import { InfinityIcon, X } from "lucide-react"
import Image from "next/image"

type Props = {
  gems: number
  percentage: number
  hasActiveSubscription: boolean
  exerciseTitle?: string // Add title, optional
  exerciseNumber?: number // Add exercise_number, optional
}

export const ExerciseHeader = ({
  gems,
  percentage,
  hasActiveSubscription,
  exerciseTitle,
  exerciseNumber,
}: Props) => {
  const { open } = useExitModal()

  return (
    <header className="mx-auto flex w-full max-w-[1140px] flex-col items-start gap-y-4 px-10 pt-[20px] lg:pt-[50px]">
      {/* Exercise Title */}
      {exerciseTitle && (
        <h1 className="w-full text-center text-lg font-bold text-neutral-700 lg:text-xl dark:text-neutral-300">
          {exerciseNumber
            ? `Exercise ${exerciseNumber}: ${exerciseTitle}`
            : exerciseTitle}
        </h1>
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
