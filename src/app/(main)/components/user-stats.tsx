import { Button } from "@/components/ui/button"
import { subjects } from "@/db/schema"
import { InfinityIcon } from "lucide-react"
import { FaFireFlameCurved } from "react-icons/fa6"
import Image from "next/image"
import Link from "next/link"

type Props = {
  activeSubject: typeof subjects.$inferSelect
  gems: number
  points: number
  hasActiveSubscription: boolean
  currentStreak: number
  lastActivityDate?: string | null
}

export const UserStats = ({
  activeSubject,
  gems,
  points,
  hasActiveSubscription,
  currentStreak,
  lastActivityDate,
}: Props) => {
  const today = new Date().toISOString().split("T")[0]
  const isTodayCompleted = lastActivityDate ? lastActivityDate === today : false

  return (
    <div className="flex w-full items-center justify-between gap-x-2">
      <Link href="/courses">
        <Image
          src={activeSubject.image}
          alt={activeSubject.title}
          className="rounded-md border"
          width={32}
          height={32}
        />
      </Link>
      <Link href="/store">
        <Button variant="ghost" className="text-orange-500">
          <Image
            src="/images/icons/points.svg"
            alt="Points"
            width={22}
            height={22}
          />
          {points}
        </Button>
      </Link>
      <Link href="/store">
        <Button variant="ghost" className="text-blue-500">
          <Image
            src={
              hasActiveSubscription
                ? "/images/icons/gems_unlimited.svg"
                : "/images/icons/gem.svg"
            }
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
            ? "text-orange-500 dark:text-orange-500"
            : "text-neutral-400 dark:text-neutral-600"
        }
      >
        <FaFireFlameCurved className="size-5" />
        {currentStreak}
      </Button>
    </div>
  )
}
