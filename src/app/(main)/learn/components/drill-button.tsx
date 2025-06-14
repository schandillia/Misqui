"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"
import { CircularProgressbarWithChildren } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"

type DrillButtonProps = {
  isUnlocked: boolean
  isCurrent: boolean
  isTimed: boolean
  drillNumber: number
  percentage: number
  className?: string
  disabled?: boolean
}

const DrillButton = ({
  isUnlocked,
  isCurrent,
  isTimed,
  drillNumber,
  percentage,
  className,
  disabled,
}: DrillButtonProps) => {
  const buttonContent = isTimed ? (
    <Crown
      className={cn(
        "size-10",
        isUnlocked
          ? "fill-primary-foreground text-primary-foreground"
          : "fill-neutral-400 stroke-neutral-400 text-neutral-400"
      )}
    />
  ) : (
    <span
      className={cn(
        "text-2xl font-bold",
        isUnlocked ? "text-primary-foreground" : "text-neutral-400"
      )}
    >
      {drillNumber}
    </span>
  )

  return (
    <div className="relative flex h-[102px] w-[102px] items-center justify-center">
      {isCurrent && !isTimed ? (
        <div className="text-neutral-300 dark:text-neutral-700">
          <CircularProgressbarWithChildren
            value={Number.isNaN(percentage) ? 0 : percentage}
            styles={{
              path: { stroke: "var(--color-brand-500)" },
              trail: { stroke: "currentColor" },
            }}
          >
            <Button
              variant={isUnlocked ? "secondary" : "locked"}
              className={cn(
                "relative size-[70px] rounded-full border-4 dark:border-secondary",
                className
              )}
              disabled={disabled}
            >
              {buttonContent}
            </Button>
          </CircularProgressbarWithChildren>
        </div>
      ) : (
        <Button
          variant={isUnlocked ? "secondary" : "locked"}
          className={cn(
            "relative size-[70px] border-4",
            isCurrent ? "rounded-full" : "rounded-3xl",
            !isUnlocked ? "border-neutral-300" : "dark:border-secondary",
            className
          )}
          disabled={disabled}
        >
          {buttonContent}
        </Button>
      )}
    </div>
  )
}

export default DrillButton
