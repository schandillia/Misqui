"use client"

import useSWR from "swr"
import { Header } from "@/app/(main)/learn/header"
import { Lesson } from "@/app/(main)/learn/lesson"
import { FeedWrapper } from "@/components/feed-wrapper"
import { Promo } from "@/components/promo"
import { Missions } from "@/components/missions"
import { StickyWrapper } from "@/components/sticky-wrapper"
import { UserProgress } from "@/components/user-progress"
import { exercises, lessons, courses } from "@/db/schema"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type Exercise = typeof exercises.$inferSelect & {
  completed: boolean
  percentage: number
}

type LessonType = typeof lessons.$inferSelect & {
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
  lessons: LessonType[]
  courseProgress: {
    activeExercise?:
      | (typeof exercises.$inferSelect & {
          lesson: typeof lessons.$inferSelect
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
    lessons,
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
        {lessons.map((lesson: LessonType) => (
          <div key={lesson.id} className="mb-10">
            <Lesson
              id={lesson.id}
              order={lesson.order}
              description={lesson.description}
              title={lesson.title}
              exercises={lesson.exercises}
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
