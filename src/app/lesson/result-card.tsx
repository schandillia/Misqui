import { cn } from "@/lib/utils"
import Image from "next/image"

type Props = {
  value: number
  variant: "points" | "gems"
}

export const ResultCard = ({ value, variant }: Props) => {
  const imageSrc = variant === "gems" ? "/gem.svg" : "/points.svg"

  return (
    <div
      className={cn(
        "rounded-2xl border-2 w-full",
        variant === "points" &&
          "bg-orange-400 dark:bg-orange-900 border-orange-400 dark:border-orange-900",
        variant === "gems" &&
          "bg-blue-400 dark:bg-blue-900 border-blue-400 dark:border-blue-900"
      )}
    >
      <div
        className={cn(
          "p-1.5 text-white rounded-t-xl font-bold text-center uppercase text-xs",
          variant === "points" && "bg-orange-400 dark:bg-orange-900",
          variant === "gems" && "bg-blue-400 dark:bg-blue-900"
        )}
      >
        {variant === "gems" ? "Gems Left" : "Total Points"}
      </div>
      <div
        className={cn(
          "rounded-2xl bg-white dark:bg-black items-center justify-center flex p-6 font-bold text-lg",
          variant === "points" && "text-orange-500 dark:text-orange-400",
          variant === "gems" && "text-blue-500 dark:text-blue-400"
        )}
      >
        <Image
          alt="Icon"
          src={imageSrc}
          height={30}
          width={30}
          className="mr-1.5"
        />
        {value}
      </div>
    </div>
  )
}
