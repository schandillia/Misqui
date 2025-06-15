import { Items } from "@/app/(main)/store/components/items"
import { HeaderSection } from "@/app/(main)/components/header-section"
import { getStats, getUserSubscription } from "@/db/queries"
import { redirect } from "next/navigation"
import { UserStats } from "@/app/(main)/components/user-stats"
import { PromoCard } from "@/app/(main)/components/promo-card"
import { RightColumn } from "@/app/(main)/components/right-column"
import { Feed } from "@/app/(main)/components/feed"
import { MissionsCard } from "@/app/(main)/components/missions-card"

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
        <MissionsCard points={userStats.points} />
      </RightColumn>
      <Feed>
        <div className="flex w-full flex-col items-center">
          <HeaderSection
            imageSrc="/images/icons/store.svg"
            imageAlt="Store"
            title="Store"
            description="Spend your points on cool stuff"
          />
          <Items
            gems={userStats.gems}
            points={userStats.points}
            hasActiveSubscription={isPro}
          />
        </div>
      </Feed>
    </div>
  )
}
export default Page
