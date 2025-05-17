// src/db/queries/lessons.ts
import { cache } from "react"
import { db } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq } from "drizzle-orm"
import {
  lessons,
  exercises,
  challengeProgress,
  challenges,
  userExerciseChallengeSubset,
} from "@/db/schema"
import app from "@/lib/data/app.json"
import { logger } from "@/lib/logger"

// Define types for the computed data
type ComputedExercise = typeof exercises.$inferSelect & {
  challenges: (typeof challenges.$inferSelect & {
    challengeProgress: (typeof challengeProgress.$inferSelect)[]
  })[]
  completed: boolean
  percentage: number
}

type ComputedLesson = typeof lessons.$inferSelect & {
  exercises: ComputedExercise[]
}

export const getLessons = cache(
  async (courseId: number): Promise<ComputedLesson[]> => {
    logger.info("Fetching lessons for course", { courseId })
    const session = await auth()
    if (!session?.user?.id) {
      logger.warn("No user session found when fetching lessons", { courseId })
      return []
    }

    try {
      const data = await db.query.lessons.findMany({
        where: eq(lessons.courseId, courseId),
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          exercises: {
            orderBy: (exercises, { asc }) => [asc(exercises.order)],
            with: {
              challenges: {
                orderBy: (challenges, { asc }) => [asc(challenges.order)],
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

      // Compute completed and percentage for each exercise
      const lessonsWithComputedExercises = await Promise.all(
        data.map(async (lesson) => {
          const exercisesWithComputedFields = await Promise.all(
            lesson.exercises.map(async (exercise) => {
              // Fetch the subset of challenge IDs for this exercise
              const subsetIds =
                await db.query.userExerciseChallengeSubset.findFirst({
                  where: eq(
                    userExerciseChallengeSubset.exerciseId,
                    exercise.id
                  ),
                  columns: { challengeIds: true },
                })

              const challengeIds = subsetIds
                ? (JSON.parse(subsetIds.challengeIds) as number[])
                : []

              // Fetch challenges in the subset
              const challengesInSubset = exercise.challenges.filter((ch) =>
                challengeIds.includes(ch.id)
              )

              // Compute completed
              const completed = challengesInSubset.every(
                (challenge) =>
                  challenge.challengeProgress &&
                  challenge.challengeProgress.length > 0 &&
                  challenge.challengeProgress.every(
                    (progress) => progress.completed
                  )
              )

              // Compute percentage
              const completedChallenges = challengesInSubset.filter(
                (challenge) =>
                  challenge.challengeProgress &&
                  challenge.challengeProgress.length > 0 &&
                  challenge.challengeProgress.every(
                    (progress) => progress.completed
                  )
              )
              const percentage = Math.round(
                (100 * completedChallenges.length) /
                  Math.min(
                    challengesInSubset.length,
                    app.CHALLENGES_PER_EXERCISE
                  )
              )

              return {
                ...exercise,
                completed,
                percentage,
              }
            })
          )

          return {
            ...lesson,
            exercises: exercisesWithComputedFields,
          }
        })
      )

      logger.info("Lessons fetched", {
        courseId,
        count: lessonsWithComputedExercises.length,
      })
      return lessonsWithComputedExercises
    } catch (error) {
      logger.error("Error fetching lessons", { courseId, error })
      throw error
    }
  }
)

export const getLessonNotes = cache(
  async (lessonId: number): Promise<string | null> => {
    logger.info("Fetching notes for lesson", { lessonId })
    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      columns: { notes: true },
    })

    return lesson?.notes ?? null
  }
)
