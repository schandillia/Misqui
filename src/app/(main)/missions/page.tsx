import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import { redirect } from "next/navigation"
import app from "@/lib/data/app.json"
import { HeaderSection } from "@/app/(main)/components/header-section"
import { getStats, getUserSubscription } from "@/db/queries"
import { Feed } from "@/app/(main)/components/feed"
import { UserStats } from "@/app/(main)/components/user-stats"
import { RightColumn } from "@/app/(main)/components/right-column"
import { PromoCard } from "@/app/(main)/components/promo-card"

const missions = app.MISSIONS

const Page = async () => {
  const userStatsData = getStats()
  const userSubscriptionData = getUserSubscription()

  const [userStats, userSubscription] = await Promise.all([
    userStatsData,
    userSubscriptionData,
  ])

  if (!userStats || !userStats.activeCourse) redirect("/courses")

  const isPro = !!userSubscription?.isActive

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <RightColumn>
        <UserStats
          activeCourse={userStats.activeCourse}
          gems={userStats.gems}
          points={userStats.points}
          hasActiveSubscription={isPro}
          currentStreak={userStats.currentStreak}
          lastActivityDate={userStats.lastActivityDate}
        />
        {!isPro && <PromoCard />}
      </RightColumn>
      <Feed>
        <div className="flex w-full cursor-default flex-col items-center">
          <HeaderSection
            imageSrc="/images/icons/missions.svg"
            imageAlt="Missions"
            title="Missions"
            description="Complete missions by earning points"
          />
          <ul className="w-full">
            {missions.map((mission) => {
              const progress = (userStats.points / mission.VALUE) * 100
              return (
                <div
                  key={mission.TITLE}
                  className="flex w-full items-center gap-x-4 border-t-2 p-4"
                >
                  <Image
                    src="/images/icons/points.svg"
                    width={60}
                    height={60}
                    alt="Points"
                  />
                  <div className="flex w-full flex-col gap-y-2">
                    <p className="text-xl font-bold text-neutral-700 dark:text-neutral-300">
                      {mission.TITLE}
                    </p>
                    <Progress value={progress} className="h-3" />
                  </div>
                </div>
              )
            })}
          </ul>
        </div>
      </Feed>
    </div>
  )
}
export default Page
