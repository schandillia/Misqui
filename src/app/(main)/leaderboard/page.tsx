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
        <div className="w-full flex flex-col items-center cursor-default">
          <HeaderSection
            imageSrc="/leaderboard.svg"
            imageAlt="Leaderboard"
            title="Leaderboard"
            description="See where you stand among your peers"
            separator
          />
          {leaderboard.map((userProgress, index) => (
            <div
              key={userProgress.userId}
              className="flex items-center w-full p-2 px-4 rounded-2xl hover:bg-brand-200/50 dark:hover:bg-brand-500/10"
            >
              {index < 3 ? (
                <span
                  className={`flex items-center justify-center size-8 rounded-full border-2 ${
                    index === 0
                      ? "bg-yellow-500 border-yellow-200"
                      : index === 1
                      ? "bg-gray-300 border-gray-100"
                      : "bg-orange-500 border-orange-300"
                  }`}
                >
                  <p
                    className={`font-bold text-sm ${
                      index === 2 ? "text-neutral-300" : "text-neutral-700"
                    }`}
                  >
                    {index + 1}
                  </p>
                </span>
              ) : (
                <p className="font-bold text-neutral-500 dark:text-neutral-400 text-xl w-8 text-center">
                  {index + 1}
                </p>
              )}
              <UserAvatar
                image={userProgress.image}
                name={userProgress.name}
                className="size-12 cursor-pointer mr-6 ml-5"
              />
              <p className="text-natural-800 font-bold flex-1">
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
