import { Feed } from "@/app/(main)/components/feed"
import { HeaderSection } from "@/app/(main)/components/header-section"
import { MissionsCard } from "@/app/(main)/components/missions-card"
import { PromoCard } from "@/app/(main)/components/promo-card"
import { RightColumn } from "@/app/(main)/components/right-column"
import { UserStats } from "@/app/(main)/components/user-stats"
import { UserAvatar } from "@/components/user-avatar"
import { getStats, getTopTenUsers, getUserSubscription } from "@/db/queries"
import { redirect } from "next/navigation"

const Page = async () => {
  const userStatsData = getStats()
  const userSubscriptionData = getUserSubscription()
  const leaderboardData = getTopTenUsers()

  const [userStats, userSubscription, leaderboard] = await Promise.all([
    userStatsData,
    userSubscriptionData,
    leaderboardData,
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
        <div className="flex w-full cursor-default flex-col items-center">
          <HeaderSection
            imageSrc="/images/icons/leaderboard.svg"
            imageAlt="Leaderboard"
            title="Leaderboard"
            description="See where you stand among your peers"
            separator
          />
          {leaderboard.map((userStats, index) => (
            <div
              key={userStats.userId}
              className="hover:bg-brand-200/50 dark:hover:bg-brand-500/10 flex w-full items-center
                rounded-3xl p-2 px-4"
            >
              {index < 3 ? (
                <span
                  className={`relative flex size-8 items-center justify-center overflow-hidden rounded-full
                    border-2 ${
                    index === 0
                        ? "border-yellow-200 bg-yellow-500"
                        : index === 1
                          ? "border-gray-100 bg-gray-300"
                          : "border-orange-300 bg-orange-500"
                    }`}
                >
                  <div
                    className="animate-shine absolute inset-0 bg-gradient-to-r from-transparent via-white/50
                      to-transparent"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                  <p
                    className={`relative z-10 text-sm font-bold ${
                      index === 2 ? "text-neutral-300" : "text-neutral-700" }`}
                  >
                    {index + 1}
                  </p>
                </span>
              ) : (
                <p className="w-8 text-center text-xl font-bold text-neutral-500 dark:text-neutral-400">
                  {index + 1}
                </p>
              )}
              <UserAvatar
                image={userStats.image}
                name={userStats.name}
                className="mr-6 ml-5 size-12 cursor-pointer"
              />
              <p className="text-natural-800 flex-1 font-bold">
                {userStats.name}
              </p>
              <p className="text-muted-foreground">{userStats.points} points</p>
            </div>
          ))}
        </div>
      </Feed>
    </div>
  )
}
export default Page
