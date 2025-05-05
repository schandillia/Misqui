import { Button } from "@/components/ui/button"
import { courses } from "@/db/schema"
import { InfinityIcon, FlameIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type Props = {
  activeCourse: typeof courses.$inferSelect
  gems: number
  points: number
  hasActiveSubscription: boolean
  currentStreak: number
  lastActivityDate?: string | null
}

export const UserProgress = ({
  activeCourse,
  gems,
  points,
  hasActiveSubscription,
  currentStreak,
  lastActivityDate,
}: Props) => {
  const today = new Date().toISOString().split("T")[0]
  const isTodayCompleted = lastActivityDate === today

  return (
    <div className="flex items-center justify-between gap-x-2 w-full">
      <Link href="/courses">
        <Button variant="ghost">
          <Image
            src={activeCourse.image}
            alt={activeCourse.title}
            className="rounded-md border"
            width={32}
            height={32}
          />
        </Button>
      </Link>
      <Link href="/store">
        <Button variant="ghost" className="text-orange-500">
          <Image src="/points.svg" alt="Points" width={22} height={22} />
          {points}
        </Button>
      </Link>
      <Link href="/store">
        <Button variant="ghost" className="text-blue-500">
          <Image
            src={hasActiveSubscription ? "/gems_unlimited.svg" : "gem.svg"}
            alt="Gems"
            width={22}
            height={22}
          />
          {hasActiveSubscription ? (
            <InfinityIcon className="size-4 stroke-3" />
          ) : (
            gems
          )}
        </Button>
      </Link>
      <Button
        variant="ghost"
        className={
          isTodayCompleted
            ? "text-orange-500"
            : "text-gray-400 dark:text-gray-500"
        }
      >
        <FlameIcon className="size-5" />
        {currentStreak}
      </Button>
    </div>
  )
}
