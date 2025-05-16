// src/app/lesson/footer.tsx
import { useMedia } from "react-use"
import { CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type Props = {
  disabled?: boolean
  status: "correct" | "wrong" | "none" | "completed"
  lessonId?: number
  onCheck: (event?: React.MouseEvent | KeyboardEvent) => void
  isTimed?: boolean
}

export const Footer = ({
  disabled,
  status,
  lessonId,
  onCheck,
  isTimed = false,
}: Props) => {
  const isMobile = useMedia("(max-width: 1024px)", false)

  const handleClick = (event: React.MouseEvent) => {
    if (disabled) return
    onCheck(event)
  }

  return (
    <footer
      className={cn(
        "lg:-h[140px] h-[100px] border-t-2",
        status === "correct" &&
          "border-transparent bg-emerald-100 dark:bg-emerald-950/90",
        status === "wrong" &&
          "border-transparent bg-rose-100 dark:bg-rose-950/90"
      )}
    >
      <div className="max-w-[1140px] h-full mx-auto flex items-center justify-between px-6 lg:px-10">
        {status === "correct" && (
          <div className="text-emerald-500 font-bold text-base lg:text-2xl flex items-center">
            <CheckCircle className="size-6 lg:size-10 mr-4" />
            Nicely done!
          </div>
        )}
        {status === "wrong" && (
          <div className="text-rose-500 font-bold text-base lg:text-2xl flex items-center">
            <XCircle className="size-6 lg:size-10 mr-4" />
            Try again.
          </div>
        )}
        {status === "completed" && (
          <Button
            variant="default"
            size={isMobile ? "sm" : "lg"}
            onClick={() =>
              (window.location.href = isTimed
                ? `/lesson/${lessonId}`
                : `/lesson/${lessonId}?purpose=practice`)
            }
          >
            Practice again
          </Button>
        )}
        <Button
          disabled={disabled}
          className="ml-auto"
          onClick={handleClick}
          size={isMobile ? "sm" : "lg"}
          variant={status === "wrong" ? "danger" : "secondary"}
        >
          {status === "none" && "Check"}
          {status === "correct" && "Next"}
          {status === "wrong" && (isTimed ? "Next" : "Retry")}
          {status === "completed" && "Continue"}
        </Button>
      </div>
    </footer>
  )
}
