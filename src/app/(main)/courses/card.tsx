import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import Image from "next/image"

type Props = {
  id: number
  title: string
  image: string
  onClick: (id: number) => void
  disabled?: boolean
  active?: boolean
}

export const Card = ({
  id,
  title,
  image,
  onClick,
  disabled,
  active,
}: Props) => {
  return (
    <div
      onClick={() => onClick(id)}
      className={cn(
        "flex h-full min-h-[217px] min-w-[200px] cursor-pointer flex-col items-center justify-between rounded-3xl border-2 border-b-4 p-3 pb-6 hover:bg-black/5 active:border-b-2 dark:hover:bg-neutral-800",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <div className="flex min-h-[24px] w-full items-center justify-end">
        {active && (
          <div className="bg-brand-600 flex items-center justify-center rounded-full p-1.5">
            <Check className="size-4 stroke-[4] text-white" />
          </div>
        )}
      </div>

      <Image
        src={image}
        alt={title}
        height={70}
        width={93.33}
        className="rounded-lg border object-cover drop-shadow-md"
      />
      <p className="mt-3 text-center font-bold text-neutral-700 dark:text-neutral-400">
        {title}
      </p>
    </div>
  )
}
