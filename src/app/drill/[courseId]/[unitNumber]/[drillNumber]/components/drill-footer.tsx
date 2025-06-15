"use client"

import { useKey, useMedia } from "react-use"
import { CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type DrillFooterProps = {
  disabled?: boolean
  status: "correct" | "wrong" | "none" | "completed"
  isTimed: boolean
  onCheck: () => void
  className?: string
  explanation?: string | null
}

export const DrillFooter = ({
  disabled,
  status,
  isTimed,
  onCheck,
  className,
  explanation,
}: DrillFooterProps) => {
  useKey("Enter", onCheck, {}, [onCheck])
  const isMobile = useMedia("(max-width: 1024px)", false)

  return (
    <footer
      className={cn(
        "fixed bottom-0 left-0 w-full h-[70px] border-t-2 lg:h-[90px] z-10",
        status === "correct" &&
          "border-transparent bg-emerald-100 dark:bg-emerald-950/90",
        status === "wrong" &&
          "border-transparent bg-rose-100 dark:bg-rose-950/90",
        className
      )}
    >
      <div className="mx-auto flex h-full max-w-[1140px] items-center px-6 lg:px-10">
        {status === "correct" && (
          <div className="flex flex-col items-start text-base font-bold text-emerald-500 lg:text-2xl">
            <div className="flex items-center">
              <CheckCircle className="mr-4 size-6 lg:size-10" />
              Nicely done!
            </div>
            {!isTimed && explanation && (
              <div className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
                {explanation}
              </div>
            )}
          </div>
        )}
        {status === "wrong" && (
          <div className="flex flex-col items-start text-base font-bold text-rose-500 lg:text-2xl">
            <div className="flex items-center">
              <XCircle className="mr-4 size-6 lg:size-10" />
              {isTimed ? "Oops!" : "Try again"}
            </div>
            {!isTimed && explanation && (
              <div className="mt-2 text-sm text-rose-700 dark:text-rose-300">
                {explanation}
              </div>
            )}
          </div>
        )}
        {status === "completed" && (
          <div className="flex w-full items-center justify-between">
            <Button
              variant="default"
              size={isMobile ? "sm" : "lg"}
              onClick={() => window.location.reload()}
            >
              {isTimed ? "Test Again" : "Practice Again"}
            </Button>
            <Button
              onClick={onCheck}
              disabled={disabled}
              size={isMobile ? "sm" : "lg"}
              variant="primary"
            >
              Continue
            </Button>
          </div>
        )}
        {(status === "correct" || status === "wrong" || status === "none") && (
          <Button
            disabled={disabled}
            className={cn(
              "ml-auto",
              status === "correct" &&
                `bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400
                hover:to-emerald-600 dark:from-emerald-600 dark:to-emerald-800
                dark:hover:from-emerald-500 dark:hover:to-emerald-700`
            )}
            onClick={onCheck}
            size={isMobile ? "sm" : "lg"}
            variant={status === "wrong" ? "danger" : "secondary"}
          >
            {status === "none" && "Check"}
            {status === "correct" && "Next"}
            {status === "wrong" && (isTimed ? "Next" : "Retry")}
          </Button>
        )}
      </div>
    </footer>
  )
}
