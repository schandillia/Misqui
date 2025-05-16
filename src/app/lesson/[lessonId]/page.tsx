import { QuizWrapper } from "@/app/lesson/quiz-wrapper"
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
  const { purpose: queryPurpose } = await searchParams
  const lessonIdNumber = Number(lessonId)

  // Validate queryPurpose to match the expected type for getLesson
  const validatedPurpose: "lesson" | "practice" | undefined =
    queryPurpose === "practice"
      ? "practice"
      : queryPurpose === "lesson"
      ? "lesson"
      : undefined

  const lessonData = getLesson(lessonIdNumber, validatedPurpose)
  const userProgressData = getUserProgress()
  const userSubscriptionData = getUserSubscription()

  const [lesson, userProgress, userSubscription] = await Promise.all([
    lessonData,
    userProgressData,
    userSubscriptionData,
  ])

  if (!lesson || !userProgress) redirect("/learn")

  // Calculate initialPercentage first
  const initialPercentage =
    (lesson.challenges.filter((challenge) => challenge.completed).length /
      Math.min(lesson.challenges.length, app.CHALLENGES_PER_LESSON)) *
    100

  // Set purpose: force "practice" if initialPercentage === 100 and isTimed === false
  const lessonPurpose =
    validatedPurpose === "practice" ||
    (!lesson.isTimed && initialPercentage === 100)
      ? "practice"
      : "lesson"

  // Reset initialPercentage to 0 for practice sessions
  const finalInitialPercentage =
    lessonPurpose === "practice" ? 0 : initialPercentage

  return (
    <QuizWrapper
      initialLessonId={lesson.id}
      initialLessonChallenges={lesson.challenges}
      initialGems={userProgress.gems}
      initialPercentage={finalInitialPercentage}
      userSubscription={userSubscription}
      purpose={lessonPurpose}
      isTimed={lesson.isTimed}
    />
  )
}

export default Page
