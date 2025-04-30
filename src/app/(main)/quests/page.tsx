import { FeedWrapper } from "@/components/feed-wrapper"
import { Promo } from "@/components/promo"
import { StickyWrapper } from "@/components/sticky-wrapper"
import { Progress } from "@/components/ui/progress"
import { UserProgress } from "@/components/user-progress"
import { getUserProgress, getUserSubscription } from "@/db/queries"
import Image from "next/image"
import { redirect } from "next/navigation"
import app from "@/lib/data/app.json"
import { HeaderSection } from "@/components/header-section"

const quests = app.QUESTS

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
        />
        {!isPro && <Promo />}
      </StickyWrapper>
      <FeedWrapper>
        <div className="w-full flex flex-col items-center cursor-default">
          <HeaderSection
            imageSrc="/quests.svg"
            imageAlt="Quests"
            title="Quests"
            description="Complete quests by earning points"
          />
          <ul className="w-full">
            {quests.map((quest) => {
              const progress = (userProgress.points / quest.VALUE) * 100
              return (
                <div
                  key={quest.TITLE}
                  className="flex items-center w-full p-4 gap-x-4 border-t-2"
                >
                  <Image
                    src="/points.svg"
                    width={60}
                    height={60}
                    alt="Points"
                  />
                  <div className="flex flex-col w-full gap-y-2">
                    <p className="text-neutral-700 dark:text-neutral-300 font-bold text-xl">
                      {quest.TITLE}
                    </p>
                    <Progress value={progress} className="h-3" />
                  </div>
                </div>
              )
            })}
          </ul>
        </div>
      </FeedWrapper>
    </div>
  )
}
export default Page
