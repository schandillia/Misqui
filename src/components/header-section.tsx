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
    <div className="w-full flex flex-col items-center cursor-default px-4 sm:px-6">
      <Image
        src={imageSrc}
        alt={imageAlt}
        height={80}
        width={80}
        className="mb-2"
      />
      <h1 className="text-center font-bold text-neutral-700 dark:text-neutral-400 text-2xl mt-2 mb-1 sm:text-3xl">
        {title}
      </h1>
      <p className="text-muted-foreground text-center text-base sm:text-lg max-w-2xl mb-6">
        {description}
      </p>
      {separator && (
        <Separator className="w-full max-w-md h-0.5 rounded-full mb-6" />
      )}
    </div>
  )
}
