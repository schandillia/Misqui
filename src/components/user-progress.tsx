import { Button } from "@/components/ui/button"
import { InfinityIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type Props = {
  activeCourse: { imgSrc: string; title: string }
  gems: number
  points: number
  hasActiveSubscription: boolean
}

export const UserProgress = ({
  activeCourse,
  gems,
  points,
  hasActiveSubscription,
}: Props) => {
  return (
    <div className="flex items-center justify-between gap-x-2 w-full">
      <Link href="/courses">
        <Button variant="ghost">
          <Image
            src={activeCourse.imgSrc}
            alt={activeCourse.title}
            className="rounded-md border"
            width={32}
            height={32}
          />
        </Button>
      </Link>
      <Link href="/shop">
        <Button variant="ghost" className="text-orange-500">
          <Image src="/points.svg" alt="Points" width={22} height={22} />
          {points}
        </Button>
      </Link>
      <Link href="/shop">
        <Button variant="ghost" className="text-blue-500">
          <Image src="/gem.svg" alt="Gems" width={22} height={22} />
          {hasActiveSubscription ? (
            <InfinityIcon className="size-4 stroke-3" />
          ) : (
            gems
          )}
        </Button>
      </Link>
    </div>
  )
}
