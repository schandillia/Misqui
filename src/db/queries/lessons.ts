// src/db/queries/lessons.ts
import { cache } from "react"
import { db } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq, and } from "drizzle-orm"
import { challengeProgress, lessons, exercises as exercisesSchema, userTimedExerciseCompletions } from "@/db/schema"
import { getUserProgress } from "@/db/queries/user-progress"
import { getExercisePercentageForExercise } from "@/db/queries/user-progress"
import app from "@/lib/data/app.json"
import { logger } from "@/lib/logger"

export const getLessons = cache(async () => {
  const session = await auth()
  const userProgress = await getUserProgress()

  if (!session?.user?.id || !userProgress?.activeCourseId) {
    return []
  }

  const data = await db.query.lessons.findMany({
    orderBy: (lessons, { asc }) => [asc(lessons.order)],
    where: eq(lessons.courseId, userProgress.activeCourseId),
    columns: {
      id: true,
      title: true,
      description: true,
      courseId: true,
      order: true,
      createdAt: true,
      updatedAt: true,
    },
    with: {
      exercises: {
        orderBy: (exercises, { asc }) => [asc(exercises.order)],
        with: {
          challenges: {
            orderBy: (challenges, { asc }) => [asc(challenges.order)],
            limit: app.CHALLENGES_PER_EXERCISE,
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, session.user.id),
              },
            },
          },
        },
      },
    },
  })

  // Compute percentages and completed status for each exercise
  const normalizedData = await Promise.all(
    data.map(async (lesson) => {
      const exercisesWithCompletedStatus = await Promise.all(
        lesson.exercises.map(async (exercise: typeof exercisesSchema.$inferSelect) => { // Add type for exercise
          const percentage = await getExercisePercentageForExercise(exercise.id);
          let completed = false;

          // Directly use exercise.isTimed. Drizzle selects all columns by default for relations
          // if 'columns' is not specified for the 'exercises' relation in the main query.
          if (exercise.isTimed) { // exercise.isTimed should be available here
            if (session?.user?.id) { // Ensure session and user ID exist
              const timedCompletionRecord = await db.query.userTimedExerciseCompletions.findFirst({
                where: and(
                  eq(userTimedExerciseCompletions.userId, session.user.id),
                  eq(userTimedExerciseCompletions.exerciseId, exercise.id)
                ),
                columns: { // Only need to check for existence
                  userId: true 
                }
              });
              completed = !!timedCompletionRecord;
            } else {
              // Handle case where session or user.id is not available
              completed = false; 
            }
          } else {
            completed = percentage === 100;
          }
          return { ...exercise, percentage, completed };
        })
      )
      return { ...lesson, exercises: exercisesWithCompletedStatus }
    })
  )

  return normalizedData
})

export async function getLessonsByCourse(courseId: number) {
  logger.info("Fetching lessons for course", { courseId })
  try {
    const data = await db.query.lessons.findMany({
      where: eq(lessons.courseId, courseId),
      columns: {
        id: true,
        title: true,
        description: true,
        courseId: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (!data || data.length === 0) {
      logger.warn("No lessons found for course", { courseId })
      return []
    }
    logger.info("Lessons fetched for course", {
      courseId,
      lessonCount: data.length,
    })
    return data
  } catch (error) {
    logger.error("Error fetching lessons for course", { courseId, error })
    throw error
  }
}

export const getLessonNotes = cache(async (lessonId: number) => {
  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    columns: {
      notes: true,
    },
  })
  return data?.notes || null
})
