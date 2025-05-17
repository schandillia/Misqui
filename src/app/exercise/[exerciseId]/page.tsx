// @/app/[exerciseId]/page.tsx
import { QuizWrapper } from "@/app/exercise/quiz-wrapper"
import { getExercise, getUserProgress, getUserSubscription } from "@/db/queries"
import { redirect } from "next/navigation"
import app from "@/lib/data/app.json"

const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ exerciseId: string }>
  searchParams: Promise<{ isPractice?: string }>
}) => {
  const { exerciseId } = await params
  const { isPractice } = await searchParams
  const exerciseIdNumber = Number(exerciseId)
  const exerciseIsPractice = isPractice === "true"
  const exerciseData = getExercise(exerciseIdNumber, exerciseIsPractice)
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
      initialExerciseId={exercise.id}
      initialExerciseChallenges={exercise.challenges}
      initialGems={userProgress.gems}
      initialPercentage={initialPercentage}
      initialExerciseTitle={exercise.title} // Pass title
      initialExerciseNumber={exercise.exercise_number} // Pass exercise_number
      userSubscription={userSubscription}
      isPractice={exerciseIsPractice}
    />
  )
}

export default Page
