import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

type Props = {
  id: number
  title: string
  image: string
  onClick: (id: number) => void
  disabled?: boolean
  active?: boolean
}

export const CourseCard = ({
  id,
  title,
  image,
  onClick,
  disabled,
  active,
}: Props) => {
  return (
    <Card
      onClick={() => onClick(id)}
      className={cn(
        `group relative flex h-full min-h-[200px] w-full cursor-pointer flex-col
        items-center justify-between overflow-hidden rounded-3xl p-4 pb-5 shadow-sm
        transition-all duration-200 hover:bg-black/5 dark:hover:bg-neutral-800
        sm:min-h-[217px] sm:rounded-3xl sm:p-3 sm:pb-6`,
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <CardContent className="flex w-full flex-col items-center space-y-3 p-0 sm:space-y-2">
        {/* Active indicator */}
        <div className="flex min-h-[28px] w-full items-center justify-end sm:min-h-[24px]">
          {active && (
            <div
              className="bg-brand-600 flex items-center justify-center rounded-full p-2 shadow-sm
                sm:p-1.5"
            >
              <Check className="size-4 stroke-[4] text-white sm:size-4" />
            </div>
          )}
        </div>

        {/* Course image */}
        <div
          className="relative overflow-hidden rounded-xl transition-transform duration-200
            group-hover:scale-105 sm:rounded-lg"
        >
          <Image
            src={image}
            alt={title}
            height={70}
            width={93.33}
            className="border object-cover drop-shadow-md"
            sizes="(max-width: 640px) 80px, 93px"
          />
        </div>

        {/* Course title */}
        <p
          className="text-center text-sm font-bold leading-tight text-neutral-700
            dark:text-neutral-400 sm:text-base"
        >
          {title}
        </p>
      </CardContent>
    </Card>
  )
}
