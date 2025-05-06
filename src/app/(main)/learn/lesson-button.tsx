"use client"

import Link from "next/link"
import { Crown } from "lucide-react"
import { CircularProgressbarWithChildren } from "react-circular-progressbar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import "react-circular-progressbar/dist/styles.css"
import { LessonButtonWrapper } from "@/app/(main)/learn/lesson-button-wrapper"

type Props = {
  id: number
  index: number
  totalCount: number
  locked?: boolean
  current?: boolean
  percentage: number
}

export const LessonButton = ({
  id,
  index,
  totalCount,
  locked,
  current,
  percentage,
}: Props) => {
  const isLast = index === totalCount
  const isCompleted = !current && !locked
  const buttonNumber = index + 1

  const href = isCompleted ? `/lesson/${id}?purpose=practice` : "/lesson"

  return (
    <Link
      href={href}
      aria-disabled={locked}
      style={{ pointerEvents: locked ? "none" : "auto" }}
    >
      <LessonButtonWrapper
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
                    "size-[70px] border-4 dark:border-emerald-600",
                    locked ? "rounded-3xl" : ""
                  )}
                >
                  {isLast ? (
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
                        locked
                          ? "text-neutral-400"
                          : "text-primary-foreground"
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
              "size-[70px] border-4 rounded-3xl",
              !locked && "dark:border-emerald-600"
            )}
          >
            {isLast ? (
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
                  locked
                    ? "text-neutral-400"
                    : "text-primary-foreground"
                )}
              >
                {buttonNumber}
              </span>
            )}
          </Button>
        )}
      </LessonButtonWrapper>
    </Link>
  )
}
