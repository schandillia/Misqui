"use client"

import { LessonHeader } from "@/app/lesson/lesson-header"
import { challengeOptions, challenges } from "@/db/schema"
import { useState } from "react"

type Props = {
  initialLessonId: number
  initialGems: number
  initialPercentage: number
  initialLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean
    challengeOptions: (typeof challengeOptions.$inferSelect)[]
  })[]
  userSubscription: any
}

export const Quiz = ({
  // initialLessonId,
  initialGems,
  initialPercentage,
  // initialLessonChallenges,
  userSubscription,
}: Props) => {
  const [gems, setGems] = useState(initialGems)
  const [percentage, setPercentage] = useState(initialPercentage)

  return (
    <>
      <LessonHeader
        gems={gems}
        percentage={percentage}
        hasActiveSubscription={!!userSubscription?.isActive}
      />
    </>
  )
}
