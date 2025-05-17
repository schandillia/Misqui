import { useKey, useMedia } from "react-use"
import { CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type Props = {
  disabled?: boolean
  status: "correct" | "wrong" | "none" | "completed"
  lessonId?: number
  exerciseId?: number
  isTimed: boolean
  onCheck: () => void
  className?: string
}

export const Footer = ({
  disabled,
  status,
  lessonId,
  exerciseId,
  isTimed,
  onCheck,
  className,
}: Props) => {
  useKey("Enter", onCheck, {}, [onCheck])
  const isMobile = useMedia("(max-width: 1024px)", false)

  return (
    <footer
      className={cn(
        "h-[70px] border-t-2 lg:h-[90px]",
        status === "correct" &&
          "border-transparent bg-emerald-100 dark:bg-emerald-950/90",
        status === "wrong" &&
          "border-transparent bg-rose-100 dark:bg-rose-950/90",
        className
      )}
    >
      <div className="mx-auto flex h-full max-w-[1140px] items-center px-6 lg:px-10">
        {status === "correct" && (
          <div className="flex items-center text-base font-bold text-emerald-500 lg:text-2xl">
            <CheckCircle className="mr-4 size-6 lg:size-10" />
            Nicely done!
          </div>
        )}
        {status === "wrong" && (
          <div className="flex items-center text-base font-bold text-rose-500 lg:text-2xl">
            <XCircle className="mr-4 size-6 lg:size-10" />
            Try again.
          </div>
        )}
        {status === "completed" && (
          <div className="flex w-full items-center justify-between">
            <Button
              variant="default"
              size={isMobile ? "sm" : "lg"}
              onClick={() =>
                (window.location.href = `/lesson/${lessonId}/${exerciseId}${isTimed ? "" : "?isPractice=true"}`)
              }
            >
              {isTimed ? "Test Again" : "Practice Again"}
            </Button>
            <Button
              disabled={disabled}
              onClick={onCheck}
              size={isMobile ? "sm" : "lg"}
              variant="secondary"
            >
              Continue
            </Button>
          </div>
        )}
        {(status === "correct" || status === "wrong" || status === "none") && (
          <Button
            disabled={disabled}
            className="ml-auto"
            onClick={onCheck}
            size={isMobile ? "sm" : "lg"}
            variant={status === "wrong" ? "danger" : "secondary"}
          >
            {status === "none" && "Check"}
            {status === "correct" && "Next"}
            {status === "wrong" && "Retry"}
          </Button>
        )}
      </div>
    </footer>
  )
}
