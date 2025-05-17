// @/app/lesson/[lessonId]/[exerciseNumber]/page.tsx
import { QuizWrapper } from "@/app/lesson/components/quiz-wrapper"
import {
  getExerciseByLessonAndNumber,
  getUserProgress,
  getUserSubscription,
} from "@/db/queries"
import { redirect } from "next/navigation"
import app from "@/lib/data/app.json"

const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ lessonId: string; exerciseNumber: string }>
  searchParams: Promise<{ isPractice?: string }>
}) => {
  const { lessonId, exerciseNumber } = await params
  const { isPractice } = await searchParams

  const lessonIdNumber = Number(lessonId)
  const exerciseNumberInt = Number(exerciseNumber)
  const exerciseIsPractice = isPractice === "true"

  const exerciseData = getExerciseByLessonAndNumber(
    lessonIdNumber,
    exerciseNumberInt,
    exerciseIsPractice
  )
  const userProgressData = getUserProgress()
  const userSubscriptionData = getUserSubscription()

  const [exercise, userProgress, userSubscription] = await Promise.all([
    exerciseData,
    userProgressData,
    userSubscriptionData,
  ])

  if (!exercise || !userProgress) redirect("/learn")

  const initialPercentage = exerciseIsPractice
    ? 0
    : (exercise.challenges.filter((challenge) => challenge.completed).length /
        Math.min(exercise.challenges.length, app.CHALLENGES_PER_EXERCISE)) *
      100

  return (
    <QuizWrapper
      initialLessonId={exercise.lessonId}
      initialExerciseId={exercise.id}
      initialExerciseChallenges={exercise.challenges}
      initialGems={userProgress.gems}
      initialPercentage={initialPercentage}
      initialExerciseTitle={exercise.title}
      initialExerciseNumber={exercise.exercise_number}
      userSubscription={userSubscription}
      isPractice={exerciseIsPractice}
    />
  )
}

export default Page
