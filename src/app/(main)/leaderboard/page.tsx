import { FeedWrapper } from "@/components/feed-wrapper"
import { StickyWrapper } from "@/components/sticky-wrapper"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { UserProgress } from "@/components/user-progress"
import {
  getTopTenUsers,
  getUserProgress,
  getUserSubscription,
} from "@/db/queries"
import Image from "next/image"
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
      </StickyWrapper>
      <FeedWrapper>
        <div className="w-full flex flex-col items-center cursor-default">
          <Image
            src="/leaderboard.svg"
            alt="Leaderboard"
            height={90}
            width={90}
          />
          <h1 className="text-center font-bold text-neutral-800 text-2xl my-6">
            Leaderboard
          </h1>
          <p className="text-muted-foreground text-center text-lg mb-6">
            See where you stand among your peers.
          </p>
          <Separator className="mb-4 h-0.5 rounded-full" />
          {leaderboard.map((userProgress, index) => (
            <div
              key={userProgress.userId}
              className="flex items-center w-full p-2 px-4 rounded-xl hover:bg-gray-200/50"
            >
              <p className="font-bold text-lime-700 mr-4">{index + 1}</p>
              <Avatar className="border bg-brand-500 size-12 mr-6 ml-3">
                <AvatarImage
                  className="object-cover"
                  src={userProgress.image}
                />
              </Avatar>
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
