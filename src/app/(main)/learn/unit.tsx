// src/app/(main)/learn/unit.tsx
"use client"

import { LessonButton } from "@/app/(main)/learn/lesson-button"
import { UnitBanner } from "@/app/(main)/learn/unit-banner"
import { lessons, units } from "@/db/schema"

// Define the type for the lessons prop
type Lesson = typeof lessons.$inferSelect & {
  completed: boolean
  percentage: number
}

type Props = {
  id: number
  order: number
  title: string
  description: string
  lessons: Lesson[]
  activeLesson:
    | (typeof lessons.$inferSelect & {
        unit: typeof units.$inferSelect
      })
    | undefined
  activeLessonPercentage: number
}

export const Unit = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  id,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  order,
  title,
  description,
  lessons,
  activeLesson,
  activeLessonPercentage,
}: Props) => {
  return (
    <>
      <UnitBanner title={title} description={description} />
      <div className="flex items-center flex-col relative">
        {lessons.map((lesson, index) => {
          const isCurrent = lesson.id === activeLesson?.id
          const isLocked = !lesson.completed && !isCurrent
          const percentage = isCurrent
            ? activeLessonPercentage
            : lesson.completed
            ? 100
            : lesson.percentage || 0

          return (
            <LessonButton
              key={lesson.id}
              id={lesson.id}
              index={index}
              totalCount={lessons.length - 1}
              current={isCurrent}
              locked={isLocked}
              percentage={percentage}
            />
          )
        })}
      </div>
    </>
  )
}
