"use client"

import { ExerciseButton } from "@/app/(main)/learn/exercise-button"
import { LessonBanner } from "@/app/(main)/learn/lesson-banner"
import { exercises, lessons } from "@/db/schema"

type Exercise = typeof exercises.$inferSelect & {
  completed: boolean
  percentage: number
}

type Props = {
  id: number
  order: number
  title: string
  description: string
  exercises: Exercise[]
  activeExercise:
    | (typeof exercises.$inferSelect & {
        lesson: typeof lessons.$inferSelect
      })
    | undefined
  activeExercisePercentage: number
  gems: number
  hasActiveSubscription: boolean
}

export const Lesson = ({
  id,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  order,
  title,
  description,
  exercises,
  activeExercise,
  activeExercisePercentage,
  gems,
  hasActiveSubscription,
}: Props) => {
  return (
    <>
      <LessonBanner
        title={title}
        description={description}
        lessonId={id}
        firstExerciseId={exercises[0]?.id}
      />
      <div className="mt-12">
        <div className="flex w-full flex-wrap justify-between gap-y-16">
          {exercises.length > 0 ? (
            exercises.map((exercise, index) => {
              const isCurrent = exercise.id === activeExercise?.id
              const isLocked = !exercise.completed && !isCurrent
              const percentage = isCurrent
                ? activeExercisePercentage
                : exercise.completed
                  ? 100
                  : exercise.percentage || 0

              return (
                <div
                  key={exercise.id}
                  className="flex h-[102px] w-1/2 justify-center sm:w-1/4 xl:w-1/6"
                >
                  <ExerciseButton
                    id={exercise.id}
                    index={index}
                    totalCount={exercises.length - 1}
                    current={isCurrent}
                    locked={isLocked}
                    percentage={percentage}
                    gems={gems}
                    hasActiveSubscription={hasActiveSubscription}
                    isTimed={exercise.isTimed} // Pass isTimed
                  />
                </div>
              )
            })
          ) : (
            <div className="w-full text-center">No exercises available</div>
          )}
        </div>
      </div>
    </>
  )
}
