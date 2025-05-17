"use client"

import { Quiz } from "@/app/exercise/quiz"
import { challengeOptions, challenges, userSubscription } from "@/db/schema"

type Props = {
  initialExerciseId: number
  initialGems: number
  initialPercentage: number
  initialExerciseChallenges: (typeof challenges.$inferSelect & {
    completed: boolean
    challengeOptions: (typeof challengeOptions.$inferSelect)[]
  })[]
  userSubscription:
    | (typeof userSubscription.$inferSelect & {
        isActive: boolean
      })
    | null
  isPractice?: boolean
}

export const QuizWrapper = (props: Props) => {
  return <Quiz {...props} />
}
