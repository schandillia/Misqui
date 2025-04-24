import { Header } from "@/app/(main)/learn/header"
import { Unit } from "@/app/(main)/learn/unit"
import { FeedWrapper } from "@/components/feed-wrapper"
import { StickyWrapper } from "@/components/sticky-wrapper"
import { UserProgress } from "@/components/user-progress"
import { getUnits, getUserProgress } from "@/db/queries"
import { redirect } from "next/navigation"

const Page = async () => {
  const unitsData = getUnits()
  const userProgressData = await getUserProgress()

  const [userProgress, units] = await Promise.all([userProgressData, unitsData])

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses")
  }

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          gems={userProgress.gems}
          points={userProgress.points}
          hasActiveSubscription={false}
        />
      </StickyWrapper>
      <FeedWrapper>
        <Header title={userProgress.activeCourse.title} />
        {units.map((unit) => (
          <div key={unit.id} className="mb-10">
            <Unit
              id={unit.id}
              order={unit.order}
              description={unit.description}
              title={unit.title}
              lessons={unit.lessons}
              activeLesson={undefined}
              activeLessonPercentage={0}
            />
          </div>
        ))}
      </FeedWrapper>
    </div>
  )
}
export default Page
