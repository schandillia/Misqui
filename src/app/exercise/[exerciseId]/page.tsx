import { QuizWrapper } from "@/app/exercise/quiz-wrapper"
import { getExercise, getUserProgress, getUserSubscription } from "@/db/queries"
import { redirect } from "next/navigation"
import app from "@/lib/data/app.json"

// Accept searchParams in props
const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ exerciseId: string }>
  searchParams: Promise<{ purpose?: string }>
}) => {
  const { exerciseId } = await params
  const { purpose } = await searchParams
  const exerciseIdNumber = Number(exerciseId)
  const exercisePurpose = purpose === "practice" ? "practice" : "exercise"
  const exerciseData = getExercise(exerciseIdNumber, exercisePurpose)
  const userProgressData = getUserProgress()
  const userSubscriptionData = getUserSubscription()

  const [exercise, userProgress, userSubscription] = await Promise.all([
    exerciseData,
    userProgressData,
    userSubscriptionData,
  ])

  if (!exercise || !userProgress) redirect("/learn")

  const initialPercentage =
    exercisePurpose === "practice"
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
      userSubscription={userSubscription}
      purpose={exercisePurpose}
    />
  )
}
export default Page
