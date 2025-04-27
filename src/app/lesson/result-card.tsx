import { cn } from "@/lib/utils"

type Props = {
  value: number
  variant: "points" | "gems"
}

export const ResultCard = ({ value, variant }: Props) => {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 w-full",
        variant === "points" && "bg-orange-400 border-orange-400",
        variant === "gems" && "bg-blue-400 border-blue-400"
      )}
    >
      <div
        className={cn(
          "p-1.5 text-white rounded-t-xl font-bold text-center uppercase text-xs",
          variant === "points" && "bg-orange-400",
          variant === "gems" && "bg-blue-400"
        )}
      >
        {variant === "gems" ? "Gems Left" : "Total XP"}
      </div>
      <div
        className={cn(
          "rounded-2xl bg-white items-center justify-center flex p-6 font-bold text-lg",
          variant === "points" && "text-orange-500",
          variant === "gems" && "text-blue-500"
        )}
      >
        {value}
      </div>
    </div>
  )
}
