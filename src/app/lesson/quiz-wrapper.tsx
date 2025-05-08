"use client"

import { Quiz } from "./quiz"
import { challengeOptions, challenges, userSubscription } from "@/db/schema"

type Props = {
  initialLessonId: number
  initialGems: number
  initialPercentage: number
  initialLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean
    challengeOptions: (typeof challengeOptions.$inferSelect)[]
  })[]
  userSubscription:
    | (typeof userSubscription.$inferSelect & {
        isActive: boolean
      })
    | null
  purpose?: "lesson" | "practice"
}

export const QuizWrapper = (props: Props) => {
  return <Quiz {...props} />
} 