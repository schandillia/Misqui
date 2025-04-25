import { challenges } from "@/db/schema"
import { cn } from "@/lib/utils"
import Image from "next/image"

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  id,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  audio,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClick,
  text,
  image,
  shortcut,
  selected,
  status,
  disabled,
  challengeType,
}: Props) => {
  return (
    <div
      onClick={() => {}}
      className={cn(
        "h-full border-2 rounded-3xl hover:bg-black/5 p-4 lg:p-6 cursor-pointer",
        selected && "border-sky-300 bg-sky-100 hover:bg-sky-100",
        selected &&
          status === "correct" &&
          "border-green-300 bg-green-100 hover:bg-green-100",
        selected &&
          status === "wrong" &&
          "border-rose-300 bg-rose-100 hover:bg-rose-100",
        disabled && "pointer-events-none hover:bg-white",
        challengeType === "ASSIST" && "lg:p-3 w-full"
      )}
    >
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
            "text-neutral-600 text-sm lg:text-base",
            selected && "text-sky-500",
            selected && status === "correct" && "text-green-500",
            selected && status === "wrong" && "text-rose-500"
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
              "border-green-300 text-green-500",
            selected && status === "wrong" && "border-rose-300 text-rose-500"
          )}
        >
          {shortcut}
        </div>
      </div>
    </div>
  )
}
