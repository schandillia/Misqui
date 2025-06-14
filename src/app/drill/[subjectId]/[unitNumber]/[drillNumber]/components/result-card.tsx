// @/app/lesson/components/result-card.tsx
import { cn } from "@/lib/utils"
import Image from "next/image"

type Props = {
  value: number | string
  variant: "points" | "score" | "time"
  caption: string
}

export const ResultCard = ({ value, variant, caption }: Props) => {
  const imageSrc =
    variant === "points"
      ? "/images/icons/points.svg"
      : variant === "score"
        ? "/images/icons/score.svg"
        : "/images/icons/clock.svg"

  // Color mappings for different variants
  const colorMap = {
    points: {
      bgGradient: "from-orange-300 to-orange-500",
      darkBgGradient: "dark:from-orange-800 dark:to-orange-950",
      textColor: "text-orange-500 dark:text-orange-400",
      borderColor: "border-orange-400/30 dark:border-orange-700/30",
    },
    score: {
      bgGradient: "from-green-300 to-green-500",
      darkBgGradient: "dark:from-green-800 dark:to-green-950",
      textColor: "text-green-500 dark:text-green-400",
      borderColor: "border-green-400/30 dark:border-green-700/30",
    },
    time: {
      bgGradient: "from-blue-300 to-blue-500",
      darkBgGradient: "dark:from-blue-800 dark:to-blue-950",
      textColor: "text-blue-500 dark:text-blue-400",
      borderColor: "border-blue-400/30 dark:border-blue-700/30",
    },
  }

  const colors = colorMap[variant]

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl border transition-shadow duration-300",
        "shadow-lg",
        colors.borderColor,
        "bg-white/20 dark:bg-black/20",
        "overflow-hidden",
        // Add perspective for 3D effect
        "[transform:perspective(1000px)_rotateX(2deg)_rotateY(2deg)]"
      )}
    >
      {/* Background gradient element */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-15",
          colors.bgGradient,
          colors.darkBgGradient
        )}
      />

      {/* Caption header */}
      <div
        className={cn(
          "relative rounded-t-2xl p-2 text-center text-xs font-bold uppercase",
          "text-white dark:text-white/90",
          "bg-gradient-to-r",
          colors.bgGradient,
          colors.darkBgGradient
        )}
      >
        {caption}
      </div>

      {/* Value container */}
      <div
        className={cn(
          "flex items-center justify-center rounded-b-2xl p-6 font-bold",
          "bg-white/40 dark:bg-black/40",
          colors.textColor
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

      {/* Enhanced 3D overlay for depth */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl",
          "shadow-[inset_0_4px_8px_rgba(255,255,255,0.3),inset_0_-4px_8px_rgba(0,0,0,0.2)]",
          "dark:shadow-[inset_0_4px_8px_rgba(255,255,255,0.15),inset_0_-4px_8px_rgba(0,0,0,0.3)]",
          "border-[0.5px] border-white/20 dark:border-white/10"
        )}
      />
    </div>
  )
}
