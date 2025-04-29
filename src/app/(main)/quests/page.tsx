import { FeedWrapper } from "@/components/feed-wrapper"
import { Promo } from "@/components/promo"
import { StickyWrapper } from "@/components/sticky-wrapper"
import { Progress } from "@/components/ui/progress"
import { UserProgress } from "@/components/user-progress"
import { getUserProgress, getUserSubscription } from "@/db/queries"
import Image from "next/image"
import { redirect } from "next/navigation"

const quests = [
  {
    title: "Earn 20 points",
    value: 20,
  },
  {
    title: "Earn 50 points",
    value: 50,
  },
  {
    title: "Earn 100 points",
    value: 100,
  },
  {
    title: "Earn 500 points",
    value: 500,
  },
  {
    title: "Earn 1000 points",
    value: 1000,
  },
]

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
          <Image src="/quests.svg" alt="Quests" height={90} width={90} />
          <h1 className="text-center font-bold text-neutral-800 text-2xl my-6">
            Quests
          </h1>
          <p className="text-muted-foreground text-center text-lg mb-6">
            Complete quests by earning points
          </p>
          <ul className="w-full">
            {quests.map((quest) => {
              const progress = (userProgress.points / quest.value) * 100
              return (
                <div
                  key={quest.title}
                  className="flex items-center w-full p-4 gap-x-4 border-t-2"
                >
                  <Image
                    src="/points.svg"
                    width={60}
                    height={60}
                    alt="Points"
                  />
                  <div className="flex flex-col w-full gap-y-2">
                    <p className="text-neutral-700 font-bold text-xl">
                      {quest.title}
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
