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

const missions = app.MISSIONS

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
      </StickyWrapper>
      <FeedWrapper>
        <div className="flex w-full cursor-default flex-col items-center">
          <HeaderSection
            imageSrc="/images/icons/missions.svg"
            imageAlt="Missions"
            title="Missions"
            description="Complete missions by earning points"
          />
          <ul className="w-full">
            {missions.map((mission) => {
              const progress = (userProgress.points / mission.VALUE) * 100
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
      </FeedWrapper>
    </div>
  )
}
export default Page
