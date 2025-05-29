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
              // Determine if the previous exercise was completed.
              // For the first exercise in the lesson (index === 0), there's no "previous" exercise to check,
              // so we consider it as if the "previous" was completed to allow it to be unlocked
              // if it's not current and not completed itself (though typically the first exercise of the first lesson is current).
              // The actual lock status for the first exercise often depends on whether it's the activeExercise.
              const previousExerciseCompleted =
                index === 0 ? true : exercises[index - 1]?.completed || false

              // An exercise is locked if:
              // 1. It's not the current active exercise (it's not being actively worked on).
              // 2. It's not yet completed itself.
              // 3. The previous exercise in this lesson is NOT completed (this primarily locks later exercises).
              //    If it's the first exercise (index === 0), previousExerciseCompleted is true, so this part of condition is !true = false,
              //    meaning the lock status for the first exercise depends only on !isCurrent && !exercise.completed.
              const isLocked =
                !isCurrent && !exercise.completed && !previousExerciseCompleted

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
                    isTimed={exercise.isTimed}
                    lessonId={id} // Add this line to pass the lesson ID
                    exerciseNumber={exercise.exercise_number} // Add this line to pass the exercise number
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
