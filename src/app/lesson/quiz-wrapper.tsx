"use client"

import { Quiz } from "@/app/lesson/quiz"
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
  isTimed?: boolean // Add isTimed prop
}

export const QuizWrapper = ({
  initialLessonId,
  initialGems,
  initialPercentage,
  initialLessonChallenges,
  userSubscription,
  purpose,
  isTimed, // Destructure isTimed
}: Props) => {
  return (
    <Quiz
      initialLessonId={initialLessonId}
      initialGems={initialGems}
      initialPercentage={initialPercentage}
      initialLessonChallenges={initialLessonChallenges}
      userSubscription={userSubscription}
      purpose={purpose}
      isTimed={isTimed} // Pass isTimed to Quiz
    />
  )
}
