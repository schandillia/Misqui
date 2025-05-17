// @/app/lesson/components/quiz-wrapper.tsx
"use client"

import { Quiz } from "@/app/lesson/components/quiz"
import { challengeOptions, challenges, userSubscription } from "@/db/schema"

type Props = {
  initialLessonId: number
  initialExerciseId: number
  initialGems: number
  initialPoints: number
  initialPercentage: number
  initialExerciseChallenges: (typeof challenges.$inferSelect & {
    completed: boolean
    challengeOptions: (typeof challengeOptions.$inferSelect)[]
  })[]
  initialExerciseTitle: string
  initialExerciseNumber: number
  initialIsTimed: boolean
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
