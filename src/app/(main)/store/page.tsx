import { Items } from "@/app/(main)/store/items"
import { FeedWrapper } from "@/components/feed-wrapper"
import { HeaderSection } from "@/components/header-section"
import { Promo } from "@/components/promo"
import { Missions } from "@/components/missions"
import { StickyWrapper } from "@/components/sticky-wrapper"
import { UserProgress } from "@/components/user-progress"
import { getUserProgress, getUserSubscription } from "@/db/queries"
import { redirect } from "next/navigation"

const Page = async () => {
  const userProgressData = getUserProgress()
  const userSubscriptionData = getUserSubscription()

  const [userProgress, userSubscription] = await Promise.all([
    userProgressData,
    userSubscriptionData,
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
        <div className="w-full flex flex-col items-center">
          <HeaderSection
            imageSrc="/images/icons/store.svg"
            imageAlt="Store"
            title="Store"
            description="Spend your points on cool stuff"
          />
          <Items
            gems={userProgress.gems}
            points={userProgress.points}
            hasActiveSubscription={isPro}
          />
        </div>
      </FeedWrapper>
    </div>
  )
}
export default Page
