import { challenges } from "@/db/schema"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useCallback, useRef } from "react"
import { useKey } from "react-use"

type Props = {
  id: number
  text: string
  image: string | null
  audio: string | null
  shortcut: string
  selected?: boolean
  onClick: () => void
  status?: "correct" | "wrong" | "none"
  disabled?: boolean
  challengeType: (typeof challenges.$inferSelect)["challengeType"]
}

export const ChallengeCard = ({
  audio: audioSrc,
  onClick,
  text,
  image,
  shortcut,
  selected,
  status,
  disabled,
}: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleClick = useCallback(() => {
    if (disabled) return

    if (audioSrc && audioRef.current) {
      audioRef.current
        .play()
        .catch((err) => console.error("Audio playback failed:", err))
    }
    onClick()
  }, [disabled, onClick, audioSrc])

  useKey(shortcut, handleClick, {}, [handleClick])

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative h-full border-2 rounded-3xl hover:bg-black/5 dark:hover:bg-neutral-800 p-4 lg:p-6 cursor-pointer min-h-[100px] lg:min-h-[120px]", // Added relative for positioning
        selected &&
          "border-sky-300 bg-sky-100 hover:bg-sky-100 dark:bg-sky-950/90 dark:border-sky-900",
        selected &&
          status === "correct" &&
          "border-emerald-300 bg-emerald-100 hover:bg-emerald-100 dark:bg-emerald-950/90 dark:border-emerald-900",
        selected &&
          status === "wrong" &&
          "border-rose-300 bg-rose-100 hover:bg-rose-100 dark:bg-rose-950/90 dark:border-rose-900",
        disabled && "pointer-events-none hover:bg-white"
      )}
    >
      {audioSrc && <audio ref={audioRef} src={audioSrc} />}
      {image && (
        <div className="relative aspect-square mb-4 max-h-[80px] lg:max-h-[150px] w-full">
          <Image src={image} alt={text} fill />
        </div>
      )}
      <div className="flex items-center">
        <p
          className={cn(
            "text-neutral-600 dark:text-neutral-400 text-sm lg:text-base font-semibold flex-1 text-left leading-relaxed lg:leading-relaxed pr-10 lg:pr-12", // Added padding-right to avoid overlap with shortcut
            selected && "text-sky-500 dark:text-sky-500",
            selected &&
              status === "correct" &&
              "text-emerald-500 dark:text-emerald-500",
            selected && status === "wrong" && "text-rose-500 dark:text-rose-500"
          )}
        >
          {text}
        </p>
      </div>
      <div
        className={cn(
          "absolute bottom-4 right-4 lg:w-[36px] lg:h-[36px] h-[24px] w-[24px] border-2 flex items-center justify-center rounded-full text-neutral-400 lg:text-base text-sm font-semibold box-border aspect-square", // Positioned at bottom-right
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
