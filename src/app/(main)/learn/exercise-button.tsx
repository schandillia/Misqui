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

    const href = isCompleted
      ? `/exercise/${id}?purpose=practice`
      : `/exercise/${id}`
    router.push(href)
  }

  // Show crown only if isTimed is true
  const showCrown = isTimed

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
        {current ? (
          <div className="h-[102px] w-[102px] relative">
            <div className="text-neutral-300 dark:text-neutral-700">
              <CircularProgressbarWithChildren
                value={Number.isNaN(percentage) ? 0 : percentage}
                styles={{
                  path: {
                    stroke: "var(--color-brand-500)",
                  },
                  trail: {
                    stroke: "currentColor",
                  },
                }}
              >
                <Button
                  size={locked ? "default" : "rounded"}
                  variant={locked ? "locked" : "secondary"}
                  className={cn(
                    "size-[70px] border-4 dark:border-emerald-600 relative",
                    locked ? "rounded-3xl" : ""
                  )}
                >
                  {showCrown ? (
                    <Crown
                      className={cn(
                        "size-10",
                        locked
                          ? "fill-neutral-400 text-neutral-400 stroke-neutral-400"
                          : "fill-primary-foreground text-primary-foreground",
                        isCompleted && "fill-none stroke-[4]"
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
                  )}
                </Button>
              </CircularProgressbarWithChildren>
            </div>
          </div>
        ) : (
          <Button
            variant={locked ? "locked" : "secondary"}
            className={cn(
              "size-[70px] border-4 rounded-3xl relative",
              !locked && "dark:border-emerald-600"
            )}
          >
            {showCrown ? (
              <Crown
                className={cn(
                  "size-10",
                  locked
                    ? "fill-neutral-400 text-neutral-400 stroke-neutral-400"
                    : "fill-primary-foreground text-primary-foreground",
                  isCompleted && "fill-none stroke-[4]"
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
            )}
          </Button>
        )}
      </ExerciseButtonWrapper>
    </div>
  )
}
