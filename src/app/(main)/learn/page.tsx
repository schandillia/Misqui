import { Header } from "@/app/(main)/learn/header"
import { FeedWrapper } from "@/components/feed-wrapper"
import { StickyWrapper } from "@/components/sticky-wrapper"
import { UserProgress } from "@/components/user-progress"
import { getUserProgress } from "@/db/queries"
import { redirect } from "next/navigation"

const Page = async () => {
  const userProgressData = await getUserProgress()

  const [userProgress] = await Promise.all([userProgressData])

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses")
  }

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={{ title: "Chess", imgSrc: "/chess-icon.svg" }}
          gems={5}
          points={100}
          hasActiveSubscription={false}
        />
      </StickyWrapper>
      <FeedWrapper>
        <Header title="Chess" />
      </FeedWrapper>
    </div>
  )
}
export default Page
