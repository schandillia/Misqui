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
        "h-full border-2 rounded-2xl border-b-4 hover:bg-black/5 dark:hover:bg-neutral-800 cursor-pointer active:border-b-2 flex flex-col items-center justify-between p-3 pb-6 min-h-[217px] min-w-[200px]",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <div className="w-full min-h-[24px] justify-end flex items-center">
        {active && (
          <div className="rounded-full bg-brand-600 p-1.5 justify-center items-center flex">
            <Check className="text-white stroke-[4] size-4" />
          </div>
        )}
      </div>

      <Image
        src={image}
        alt={title}
        height={70}
        width={93.33}
        className="rounded-lg drop-shadow-md border object-cover"
      />
      <p className="text-neutral-700 dark:text-neutral-400 text-center mt-3 font-bold">
        {title}
      </p>
    </div>
  )
}
