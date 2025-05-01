import { challenges } from "@/db/schema"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useCallback } from "react"
import { useAudio, useKey } from "react-use"

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
  id,
  audio: audioSrc,
  onClick,
  text,
  image,
  shortcut,
  selected,
  status,
  disabled,
  challengeType,
}: Props) => {
  // Only use useAudio if audioSrc is a valid string
  const [audio, , controls] = audioSrc
    ? useAudio({ src: audioSrc, autoPlay: false })
    : [null, null, { play: () => {} }]

  const handleClick = useCallback(() => {
    if (disabled) return

    if (audioSrc) {
      controls.play()
    }
    onClick()
  }, [disabled, onClick, controls, audioSrc])

  useKey(shortcut, handleClick, {}, [handleClick])

  return (
    <div
      onClick={handleClick}
      className={cn(
        "h-full border-2 rounded-3xl hover:bg-black/5 dark:hover:bg-neutral-800 p-4 lg:p-6 cursor-pointer",
        selected &&
          "border-sky-300 bg-sky-100 hover:bg-sky-100 dark:bg-sky-950/90 dark:border-sky-900",
        selected &&
          status === "correct" &&
          "border-emerald-300 bg-emerald-100 hover:bg-emerald-100 dark:bg-emerald-950/90 dark:border-emerald-900",
        selected &&
          status === "wrong" &&
          "border-rose-300 bg-rose-100 hover:bg-rose-100 dark:bg-rose-950/90 dark:border-rose-900",
        disabled && "pointer-events-none hover:bg-white",
        challengeType === "ASSIST" && "lg:p-3 w-full"
      )}
    >
      {audio}
      {image && (
        <div className="relative aspect-square mb-4 max-h-[80px] lg:max-h-[150px] w-full">
          <Image src={image} alt={text} fill />
        </div>
      )}
      <div
        className={cn(
          "flex items-center justify-between",
          challengeType === "ASSIST" && "flex-row-reverse"
        )}
      >
        {challengeType === "ASSIST" && <div />}
        <p
          className={cn(
            "text-neutral-600 dark:text-neutral-400 text-sm lg:text-base font-semibold",
            selected && "text-sky-500 dark:text-sky-500",
            selected &&
              status === "correct" &&
              "text-emerald-500 dark:text-emerald-500",
            selected && status === "wrong" && "text-rose-500 dark:text-rose-500"
          )}
        >
          {text}
        </p>
        <div
          className={cn(
            "lg:w-[30px] lg:h-[30px] h-[20px] w-[20px] border-2 flex items-center justify-center rounded-full text-neutral-400 lg:text-[15px] text-xs font-semibold",
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
    </div>
  )
}
