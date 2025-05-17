import { cn } from "@/lib/utils"
import Image from "next/image"

type Props = {
  value: number
  variant: "points" | "gems"
}

export const ResultCard = ({ value, variant }: Props) => {
  const imageSrc =
    variant === "gems" ? "/images/icons/gem.svg" : "/images/icons/points.svg"

  return (
    <div
      className={cn(
        "w-full rounded-2xl border-2",
        variant === "points" &&
          "border-orange-400 bg-orange-400 dark:border-orange-900 dark:bg-orange-900",
        variant === "gems" &&
          "border-blue-400 bg-blue-400 dark:border-blue-900 dark:bg-blue-900"
      )}
    >
      <div
        className={cn(
          "rounded-t-xl p-1.5 text-center text-xs font-bold text-white uppercase",
          variant === "points" && "bg-orange-400 dark:bg-orange-900",
          variant === "gems" && "bg-blue-400 dark:bg-blue-900"
        )}
      >
        {variant === "gems" ? "Gems Left" : "Total Points"}
      </div>
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-white p-6 text-lg font-bold dark:bg-black",
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
