import { cn } from "@/lib/utils"
import { Volume2 } from "lucide-react"

type OptionProps = {
  id: number
  text: string
  shortcut: string
  selected?: boolean
  status?: "correct" | "wrong" | "none"
  disabled?: boolean
  onSelect: () => void
  audio?: string | null
}

export const Option = ({
  id,
  text,
  shortcut,
  selected = false,
  status = "none",
  disabled = false,
  onSelect,
  audio,
}: OptionProps) => {
  return (
    <div
      onClick={() => {
        if (disabled) return
        onSelect()
      }}
      className={cn(
        `relative h-full min-h-[100px] cursor-pointer rounded-3xl border-2 p-4
        hover:bg-black/5 lg:p-6 dark:hover:bg-neutral-800`,
        selected &&
          `border-sky-300 bg-sky-100 hover:bg-sky-100 dark:border-sky-900
          dark:bg-sky-950/90`,
        selected &&
          status === "correct" &&
          `border-emerald-300 bg-emerald-100 hover:bg-emerald-100 dark:border-emerald-900
          dark:bg-emerald-950/90`,
        selected &&
          status === "wrong" &&
          `border-rose-300 bg-rose-100 hover:bg-rose-100 dark:border-rose-900
          dark:bg-rose-950/90`,
        disabled && "pointer-events-none hover:bg-white"
      )}
      tabIndex={0}
      aria-label={`Option ${id}: ${text}`}
      onKeyDown={(e) => {
        if (disabled) return
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      {audio && <audio src={audio} />}
      <div className="relative flex items-center">
        <p
          className={cn(
            `flex-1 pr-10 text-left text-sm leading-relaxed font-semibold text-neutral-600
            lg:pr-12 lg:text-base lg:leading-relaxed dark:text-neutral-400`,
            selected && "text-sky-500 dark:text-sky-500",
            selected &&
              status === "correct" &&
              "text-emerald-500 dark:text-emerald-500",
            selected && status === "wrong" && "text-rose-500 dark:text-rose-500"
          )}
        >
          {text}
        </p>
        {audio && (
          <Volume2
            className={cn(
              "ml-2 size-5 text-neutral-400",
              selected && "text-sky-500",
              selected && status === "correct" && "text-emerald-500",
              selected && status === "wrong" && "text-rose-500"
            )}
          />
        )}
      </div>
      <div
        className={cn(
          `absolute right-4 bottom-4 box-border flex aspect-square h-[24px] w-[24px]
          items-center justify-center rounded-full border-2 text-sm font-semibold
          text-neutral-400 lg:h-[36px] lg:w-[36px] lg:text-base`,
          selected && "border-sky-300 text-sky-500",
          selected &&
            status === "correct" &&
            "border-emerald-300 text-emerald-500",
          selected && status === "wrong" && "border-rose-300 text-rose-500"
        )}
      >
        {shortcut}
      </div>
    </div>
  )
}
