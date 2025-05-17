import { FeedWrapper } from "@/components/feed-wrapper"
import { HeaderSection } from "@/components/header-section"
import { Missions } from "@/components/missions"
import { Promo } from "@/components/promo"
import { StickyWrapper } from "@/components/sticky-wrapper"
import { UserAvatar } from "@/components/user-avatar"
import { UserProgress } from "@/components/user-progress"
import {
  getTopTenUsers,
  getUserProgress,
  getUserSubscription,
} from "@/db/queries"
import { redirect } from "next/navigation"

const Page = async () => {
  const userProgressData = getUserProgress()
  const userSubscriptionData = getUserSubscription()
  const leaderboardData = getTopTenUsers()

  const [userProgress, userSubscription, leaderboard] = await Promise.all([
    userProgressData,
    userSubscriptionData,
    leaderboardData,
  ])

  if (!userProgress || !userProgress.activeCourse) redirect("/courses")

  const isPro = !!userSubscription?.isActive

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          gems={userProgress.gems}
          points={userProgress.points}
          hasActiveSubscription={isPro}
          currentStreak={userProgress.currentStreak}
          lastActivityDate={userProgress.lastActivityDate}
        />
        {!isPro && <Promo />}
        <Missions points={userProgress.points} />
      </StickyWrapper>
      <FeedWrapper>
        <div className="flex w-full cursor-default flex-col items-center">
          <HeaderSection
            imageSrc="/images/icons/leaderboard.svg"
            imageAlt="Leaderboard"
            title="Leaderboard"
            description="See where you stand among your peers"
            separator
          />
          {leaderboard.map((userProgress, index) => (
            <div
              key={userProgress.userId}
              className="hover:bg-brand-200/50 dark:hover:bg-brand-500/10 flex w-full items-center rounded-3xl p-2 px-4"
            >
              {index < 3 ? (
                <span
                  className={`relative flex size-8 items-center justify-center overflow-hidden rounded-full border-2 ${
                    index === 0
                      ? "border-yellow-200 bg-yellow-500"
                      : index === 1
                        ? "border-gray-100 bg-gray-300"
                        : "border-orange-300 bg-orange-500"
                  }`}
                >
                  <div className="animate-shine absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                  <p
                    className={`relative z-10 text-sm font-bold ${
                      index === 2 ? "text-neutral-300" : "text-neutral-700"
                    }`}
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
                image={userProgress.image}
                name={userProgress.name}
                className="mr-6 ml-5 size-12 cursor-pointer"
              />
              <p className="text-natural-800 flex-1 font-bold">
                {userProgress.name}
              </p>
              <p className="text-muted-foreground">
                {userProgress.points} points
              </p>
            </div>
          ))}
        </div>
      </FeedWrapper>
    </div>
  )
}
export default Page
