// @/app/lesson/[lessonId]/[exerciseNumber]/page.tsx
import { QuizWrapper } from "@/app/lesson/components/quiz-wrapper"
import {
  getExerciseByLessonAndNumber,
  getUserProgress,
  getUserSubscription,
  getExerciseMetaByLessonAndNumber, // Added import
} from "@/db/queries"
import { resetUserExerciseChallengeSubset } from "@/db/queries/user-progress" // Added import
import { auth } from "@/auth" // Added import
import { redirect } from "next/navigation"
import app from "@/lib/data/app.json"
import { logger } from "@/lib/logger" // Added import
import {
  exercises,
  challenges,
  challengeOptions,
  challengeProgress,
} from "@/db/schema"

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

  const session = await auth()
  const userId = session?.user?.id

  const exerciseMeta = await getExerciseMetaByLessonAndNumber(
    lessonIdNumber,
    exerciseNumberInt
  )

  if (!exerciseMeta) {
    logger.error(
      `Exercise meta not found for lesson ${lessonIdNumber}, exercise ${exerciseNumberInt}. Redirecting to /learn.`
    )
    redirect("/learn")
  }

  if (userId && !exerciseIsPractice && exerciseMeta.isTimed) {
    logger.info(
      `Resetting challenge subset for user ${userId}, timed exercise ${exerciseMeta.id}.`
    )
    await resetUserExerciseChallengeSubset(userId, exerciseMeta.id)
  }

  // Fetch full exercise data *after* potential reset
  const exerciseDataPromise = getExerciseByLessonAndNumber(
    lessonIdNumber,
    exerciseNumberInt,
    exerciseIsPractice
  ) as Promise<
    | (typeof exercises.$inferSelect & {
        challenges: (typeof challenges.$inferSelect & {
          completed: boolean
          challengeOptions: (typeof challengeOptions.$inferSelect)[]
          challengeProgress?: (typeof challengeProgress.$inferSelect)[]
        })[]
        lesson: { id: number; title: string }
      })
    | null
  >
  const userProgressDataPromise = getUserProgress()
  const userSubscriptionDataPromise = getUserSubscription()

  const [exercise, userProgress, userSubscription] = await Promise.all([
    exerciseDataPromise,
    userProgressDataPromise,
    userSubscriptionDataPromise,
  ])

  if (!exercise || !userProgress) {
    logger.error(
      `Exercise or user progress not found after full fetch for lesson ${lessonIdNumber}, exercise ${exerciseNumberInt}. Redirecting to /learn.`
    )
    redirect("/learn")
  }

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
      initialPoints={userProgress.points || 0} // Add initialPoints
      initialPercentage={initialPercentage}
      initialExerciseTitle={exercise.title}
      initialExerciseNumber={exercise.exercise_number}
      initialIsTimed={exercise.isTimed}
      userSubscription={userSubscription}
      isPractice={exerciseIsPractice}
    />
  )
}

export default Page
