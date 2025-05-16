"use client"

import useSWR from "swr"
import { Header } from "@/app/(main)/learn/header"
import { Unit } from "@/app/(main)/learn/unit"
import { FeedWrapper } from "@/components/feed-wrapper"
import { Promo } from "@/components/promo"
import { Missions } from "@/components/missions"
import { StickyWrapper } from "@/components/sticky-wrapper"
import { UserProgress } from "@/components/user-progress"
import { exercises, units, courses } from "@/db/schema"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type Exercise = typeof exercises.$inferSelect & {
  completed: boolean
  percentage: number
}

type UnitType = typeof units.$inferSelect & {
  exercises: Exercise[]
}

type ActiveCourse = typeof courses.$inferSelect

type LearnData = {
  userProgress: {
    activeCourse: ActiveCourse
    gems: number
    points: number
    currentStreak: number
    lastActivityDate?: string | null
  }
  units: UnitType[]
  courseProgress: {
    activeExercise?:
      | (typeof exercises.$inferSelect & {
          unit: typeof units.$inferSelect
        })
      | undefined
  }
  exercisePercentage: number
  userSubscription: { isActive?: boolean } | null
}

type Props = {
  initialData: LearnData
}

export function LearnClient({ initialData }: Props) {
  const { data } = useSWR<LearnData>("/api/learn-data", fetcher, {
    fallbackData: initialData,
    revalidateOnFocus: false, // Optimize performance
    revalidateOnMount: false, // Use initialData on mount
  })

  if (!data) return null

  const {
    userProgress,
    units,
    courseProgress,
    exercisePercentage,
    userSubscription,
  } = data
  const isPro = !!userSubscription?.isActive

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          gems={userProgress.gems}
          points={userProgress.points}
          hasActiveSubscription={isPro}
          currentStreak={userProgress.currentStreak}
          lastActivityDate={userProgress.lastActivityDate || undefined}
        />
        {!isPro && <Promo />}
        <Missions points={userProgress.points} />
      </StickyWrapper>
      <FeedWrapper>
        <Header title={userProgress.activeCourse.title} />
        {units.map((unit: UnitType) => (
          <div key={unit.id} className="mb-10">
            <Unit
              id={unit.id}
              order={unit.order}
              description={unit.description}
              title={unit.title}
              exercises={unit.exercises}
              activeExercise={courseProgress.activeExercise}
              activeExercisePercentage={exercisePercentage}
              gems={userProgress.gems}
              hasActiveSubscription={isPro}
            />
          </div>
        ))}
      </FeedWrapper>
    </div>
  )
}
