"use client"

import { ExerciseButton } from "@/app/(main)/learn/exercise-button"
import { UnitBanner } from "@/app/(main)/learn/unit-banner"
import { exercises, units } from "@/db/schema"

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
        unit: typeof units.$inferSelect
      })
    | undefined
  activeExercisePercentage: number
  gems: number
  hasActiveSubscription: boolean
}

export const Unit = ({
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
      <UnitBanner
        title={title}
        description={description}
        unitId={id}
        firstExerciseId={exercises[0]?.id}
      />
      <div className="mt-12">
        <div className="flex flex-wrap gap-y-16 justify-between w-full">
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
                  className="w-1/2 sm:w-1/4 xl:w-1/6 flex justify-center h-[102px]"
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
            <div className="text-center w-full">No exercises available</div>
          )}
        </div>
      </div>
    </>
  )
}
