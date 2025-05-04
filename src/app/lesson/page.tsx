import { Quiz } from "@/app/lesson/quiz"
import { getLesson, getUserProgress, getUserSubscription } from "@/db/queries"
import { redirect } from "next/navigation"
import app from "@/lib/data/app.json"

const Page = async () => {
  const lessonData = getLesson()
  const userProgressData = getUserProgress()
  const userSubscriptionData = getUserSubscription()

  const [lesson, userProgress, userSubscription] = await Promise.all([
    lessonData,
    userProgressData,
    userSubscriptionData,
  ])

  if (!lesson || !userProgress) redirect("/learn")

  const initialPercentage =
    (lesson.challenges.filter((challenge) => challenge.completed).length /
      Math.min(lesson.challenges.length, app.CHALLENGES_PER_LESSON)) *
    100

  return (
    <Quiz
      initialLessonId={lesson.id}
      initialLessonChallenges={lesson.challenges}
      initialGems={userProgress.gems}
      initialPercentage={initialPercentage}
      userSubscription={userSubscription}
    />
  )
}
export default Page
