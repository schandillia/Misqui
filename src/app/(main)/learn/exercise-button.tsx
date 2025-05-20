// @/app/(main)/learn/exercise-button.tsx
"use client"

import { useRouter } from "next/navigation"
import { Crown } from "lucide-react"
import { CircularProgressbarWithChildren } from "react-circular-progressbar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import "react-circular-progressbar/dist/styles.css"
import { ExerciseButtonWrapper } from "@/app/(main)/learn/exercise-button-wrapper"
import { useGemsModal } from "@/store/use-gems-modal"

type Props = {
  id: number
  index: number
  totalCount: number
  locked?: boolean
  current?: boolean
  percentage: number
  gems: number
  hasActiveSubscription: boolean
  isTimed: boolean
  lessonId?: number
  exerciseNumber?: number
}

export const ExerciseButton = ({
  id,
  index,
  totalCount,
  locked,
  current,
  percentage,
  gems,
  hasActiveSubscription,
  isTimed,
  lessonId,
  exerciseNumber,
}: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isLast = index === totalCount
  const isCompleted = !current && !locked
  const buttonNumber = index + 1
  const { open: openGemsModal } = useGemsModal()
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    if (locked) return

    if (gems <= 0 && !hasActiveSubscription) {
      e.preventDefault()
      openGemsModal()
      return
    }

    if (lessonId && exerciseNumber) {
      const href =
        isCompleted && !isTimed
          ? `/lesson/${lessonId}/${exerciseNumber}?isPractice=true`
          : `/lesson/${lessonId}/${exerciseNumber}`
      router.push(href)
    } else {
      console.warn(`Missing lessonId or exerciseNumber for exercise: ${id}`)
    }
  }

  const showCrown = isTimed

  // Common button content (Crown or Number)
  const buttonContent = showCrown ? (
    <Crown
      className={cn(
        "size-10",
        locked
          ? "fill-neutral-400 stroke-neutral-400 text-neutral-400"
          : "fill-primary-foreground text-primary-foreground"
      )}
    />
  ) : (
    <span
      className={cn(
        "text-2xl font-bold",
        locked ? "text-neutral-400" : "text-primary-foreground"
      )}
    >
      {buttonNumber}
    </span>
  )

  return (
    <div
      onClick={handleClick}
      className={cn("cursor-pointer", locked && "cursor-not-allowed")}
      aria-disabled={locked}
      style={{ pointerEvents: locked ? "none" : "auto" }}
    >
      <ExerciseButtonWrapper
        index={index}
        totalCount={totalCount}
        isCompleted={isCompleted}
        current={current}
      >
        {/* Always render a 102px × 102px container for layout consistency */}
        <div className="relative flex h-[102px] w-[102px] items-center justify-center">
          {current && !isTimed ? (
            // Non-timed current button with CircularProgressbar
            <div className="text-neutral-300 dark:text-neutral-700">
              <CircularProgressbarWithChildren
                value={Number.isNaN(percentage) ? 0 : percentage}
                styles={{
                  path: { stroke: "var(--color-brand-500)" },
                  trail: { stroke: "currentColor" },
                }}
              >
                <Button
                  variant={locked ? "locked" : "secondary"}
                  className={cn(
                    "relative size-[70px] rounded-full border-4 dark:border-emerald-600"
                  )}
                >
                  {buttonContent}
                </Button>
              </CircularProgressbarWithChildren>
            </div>
          ) : (
            // Timed exercises (current or not) or non-current buttons
            <Button
              variant={locked ? "locked" : "secondary"}
              className={cn(
                "relative size-[70px] border-4",
                current ? "rounded-full" : "rounded-3xl",
                !locked && "dark:border-emerald-600"
              )}
            >
              {buttonContent}
            </Button>
          )}
        </div>
      </ExerciseButtonWrapper>
    </div>
  )
}
