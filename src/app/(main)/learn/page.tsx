import { Header } from "@/app/(main)/learn/header"
import { Unit } from "@/app/(main)/learn/unit"
import { FeedWrapper } from "@/components/feed-wrapper"
import { Promo } from "@/components/promo"
import { Quests } from "@/components/quests"
import { StickyWrapper } from "@/components/sticky-wrapper"
import { UserProgress } from "@/components/user-progress"
import {
  getCourseProgress,
  getLessonPercentage,
  getUnits,
  getUserProgress,
  getUserSubscription,
} from "@/db/queries"
import { redirect } from "next/navigation"

const Page = async () => {
  const unitsData = getUnits()
  const userProgressData = getUserProgress()
  const courseProgressData = getCourseProgress()
  const lessonPercentageData = getLessonPercentage()
  const userSubsctiptionData = getUserSubscription()

  const [
    userProgress,
    units,
    courseProgress,
    lessonPercentage,
    userSubsctiption,
  ] = await Promise.all([
    userProgressData,
    unitsData,
    courseProgressData,
    lessonPercentageData,
    userSubsctiptionData,
    ,
  ])

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses")
  }
  if (!courseProgress) {
    redirect("/courses")
  }

  const isPro = !!userSubsctiption?.isActive

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
        <Header title={userProgress.activeCourse.title} />
        {units.map((unit) => (
          <div key={unit.id} className="mb-10">
            <Unit
              id={unit.id}
              order={unit.order}
              description={unit.description}
              title={unit.title}
              lessons={unit.lessons}
              activeLesson={courseProgress.activeLesson}
              activeLessonPercentage={lessonPercentage}
            />
          </div>
        ))}
      </FeedWrapper>
    </div>
  )
}
export default Page
