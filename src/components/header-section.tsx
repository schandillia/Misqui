import { Separator } from "@/components/ui/separator"
import Image from "next/image"

interface HeaderSectionProps {
  imageSrc: string
  imageAlt: string
  title: string
  description: string
  separator?: boolean
}

export const HeaderSection = ({
  imageSrc,
  imageAlt,
  title,
  description,
  separator = false,
}: HeaderSectionProps) => {
  return (
    <div className="flex w-full cursor-default flex-col items-center px-4 sm:px-6">
      <Image
        src={imageSrc}
        alt={imageAlt}
        height={80}
        width={80}
        className="mb-2"
      />
      <h1 className="mt-2 mb-1 text-center text-2xl font-bold text-neutral-700 sm:text-3xl dark:text-neutral-400">
        {title}
      </h1>
      <p className="text-muted-foreground mb-6 max-w-2xl text-center text-base sm:text-lg">
        {description}
      </p>
      {separator && (
        <Separator className="mb-6 h-0.5 w-full max-w-md rounded-full" />
      )}
    </div>
  )
}
