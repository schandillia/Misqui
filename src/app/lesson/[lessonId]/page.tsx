import { Quiz } from "@/app/lesson/quiz"
import { getLesson, getUserProgress, getUserSubscription } from "@/db/queries"
import { redirect } from "next/navigation"
import app from "@/lib/data/app.json"

// Accept searchParams in props
const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ lessonId: string }>
  searchParams: Promise<{ purpose?: string }>
}) => {
  const { lessonId } = await params
  const { purpose } = await searchParams
  const lessonIdNumber = Number(lessonId)
  const lessonPurpose = purpose === "practice" ? "practice" : "lesson"
  const lessonData = getLesson(lessonIdNumber, lessonPurpose)
  const userProgressData = getUserProgress()
  const userSubscriptionData = getUserSubscription()

  const [lesson, userProgress, userSubscription] = await Promise.all([
    lessonData,
    userProgressData,
    userSubscriptionData,
  ])

  if (!lesson || !userProgress) redirect("/learn")

  const initialPercentage =
    lessonPurpose === "practice"
      ? 0
      : (lesson.challenges.filter((challenge) => challenge.completed).length /
          Math.min(lesson.challenges.length, app.CHALLENGES_PER_LESSON)) *
        100

  return (
    <Quiz
      initialLessonId={lesson.id}
      initialLessonChallenges={lesson.challenges}
      initialGems={userProgress.gems}
      initialPercentage={initialPercentage}
      userSubscription={userSubscription}
      purpose={lessonPurpose}
    />
  )
}
export default Page
