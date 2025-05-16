// src/db/queries/units.ts
import { cache } from "react"
import { db } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq } from "drizzle-orm"
import { challengeProgress, units } from "@/db/schema"
import { getUserProgress } from "@/db/queries/user-progress"
import { getExercisePercentageForExercise } from "@/db/queries/user-progress"
import app from "@/lib/data/app.json"
import { logger } from "@/lib/logger"

export const getUnits = cache(async () => {
  const session = await auth()
  const userProgress = await getUserProgress()

  if (!session?.user?.id || !userProgress?.activeCourseId) {
    return []
  }

  const data = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, userProgress.activeCourseId),
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
    data.map(async (unit) => {
      const exercisesWithCompletedStatus = await Promise.all(
        unit.exercises.map(async (exercise) => {
          // Use getExercisePercentageForExercise to compute the percentage
          const percentage = await getExercisePercentageForExercise(exercise.id)
          const completed = percentage === 100
          return { ...exercise, percentage, completed }
        })
      )
      return { ...unit, exercises: exercisesWithCompletedStatus }
    })
  )

  return normalizedData
})

export async function getUnitsByCourse(courseId: number) {
  logger.info("Fetching units for course", { courseId })
  try {
    const data = await db.query.units.findMany({
      where: eq(units.courseId, courseId),
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
      logger.warn("No units found for course", { courseId })
      return []
    }
    logger.info("Units fetched for course", {
      courseId,
      unitCount: data.length,
    })
    return data
  } catch (error) {
    logger.error("Error fetching units for course", { courseId, error })
    throw error
  }
}

export const getUnitNotes = cache(async (unitId: number) => {
  const data = await db.query.units.findFirst({
    where: eq(units.id, unitId),
    columns: {
      notes: true,
    },
  })
  return data?.notes || null
})
