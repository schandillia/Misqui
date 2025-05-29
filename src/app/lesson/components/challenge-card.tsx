import { challenges } from "@/db/schema"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Volume2 } from "lucide-react"
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
        `relative h-full min-h-[100px] cursor-pointer rounded-3xl border-2 p-4
        hover:bg-black/5 lg:min-h-[120px] lg:p-6 dark:hover:bg-neutral-800`,
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
    >
      {audioSrc && <audio ref={audioRef} src={audioSrc} />}
      {audioSrc && image && (
        <Volume2
          className={cn(
            "absolute top-4 right-4 h-5 w-5 text-neutral-400",
            selected && "text-sky-500",
            selected && status === "correct" && "text-emerald-500",
            selected && status === "wrong" && "text-rose-500"
          )}
        />
      )}
      {image && (
        <div className="relative mb-4 aspect-square max-h-[80px] w-full lg:max-h-[150px]">
          <Image src={image} alt={text} fill />
        </div>
      )}
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
        {audioSrc && !image && (
          <Volume2
            className={cn(
              "ml-2 h-5 w-5 text-neutral-400",
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
