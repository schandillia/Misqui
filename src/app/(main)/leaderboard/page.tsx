import { FeedWrapper } from "@/components/feed-wrapper"
import { HeaderSection } from "@/components/header-section"
import { Promo } from "@/components/promo"
import { Quests } from "@/components/quests"
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
        />
        {!isPro && <Promo />}
        <Quests points={userProgress.points} />
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
              className="flex items-center w-full p-2 px-4 rounded-xl hover:bg-gray-200/50"
            >
              <p className="font-bold text-lime-700 mr-4">{index + 1}</p>
              <UserAvatar
                name={userProgress.name}
                image={userProgress.image}
                className="size-12 cursor-pointer mr-6 ml-3"
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
