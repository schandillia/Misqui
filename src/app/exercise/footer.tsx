import { useKey, useMedia } from "react-use"
import { CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type Props = {
  disabled?: boolean
  status: "correct" | "wrong" | "none" | "completed"
  exerciseId?: number
  onCheck: () => void
}

export const Footer = ({ disabled, status, exerciseId, onCheck }: Props) => {
  useKey("Enter", onCheck, {}, [onCheck])
  // Add defaultState to useMedia to prevent hydration mismatch
  const isMobile = useMedia("(max-width: 1024px)", false)

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
      <div className="mx-auto flex h-full max-w-[1140px] items-center justify-between px-6 lg:px-10">
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
          <Button
            variant="default"
            size={isMobile ? "sm" : "lg"}
            onClick={() =>
              (window.location.href = `/exercise/${exerciseId}?isPractice=true`)
            }
          >
            Practice again
          </Button>
        )}
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
          {status === "completed" && "Continue"}
        </Button>
      </div>
    </footer>
  )
}
