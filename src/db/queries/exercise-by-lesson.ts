import { cache } from "react"
import { db } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq, and, inArray } from "drizzle-orm"
import { exercises, challenges, challengeProgress } from "@/db/schema"
import { logger } from "@/lib/logger"
import { getOrCreateUserExerciseChallengeSubset } from "./exercises"

/**
 * Get an exercise by lessonId and exerciseNumber
 */
export const getExerciseByLessonAndNumber = cache(
  async (
    lessonId: number,
    exerciseNumber: number,
    isPractice: boolean = false
  ) => {
    logger.info("Fetching exercise by lesson and number", {
      lessonId,
      exerciseNumber,
      isPractice,
    })
    const session = await auth()

    if (!session?.user?.id) {
      logger.warn(
        "No user session found when fetching exercise by lesson and number",
        {
          lessonId,
          exerciseNumber,
          isPractice,
        }
      )
      return null
    }

    // Find the exercise by lessonId and exerciseNumber
    const exercise = await db.query.exercises.findFirst({
      where: and(
        eq(exercises.lessonId, lessonId),
        eq(exercises.exercise_number, exerciseNumber)
      ),
    })

    if (!exercise) {
      logger.warn("Exercise not found for lesson and number", {
        lessonId,
        exerciseNumber,
      })
      return null
    }

    // Now that we have the exerciseId, we can use the existing logic
    const exerciseId = exercise.id

    const subsetIds = await getOrCreateUserExerciseChallengeSubset(
      session.user.id,
      exerciseId,
      isPractice
    )

    const data = await db.query.exercises.findFirst({
      where: eq(exercises.id, exerciseId),
      with: {
        lesson: true,
        challenges: {
          where: inArray(challenges.id, subsetIds),
          with: {
            challengeOptions: true,
            challengeProgress: {
              where: eq(challengeProgress.userId, session.user.id),
            },
          },
        },
      },
    })

    if (!data || !data.challenges) {
      logger.warn("Exercise not found or has no challenges", {
        exerciseId,
        lessonId,
        exerciseNumber,
        isPractice,
      })
      return null
    }

    const idOrder = new Map(subsetIds.map((id, idx) => [id, idx]))
    const normalizedChallenges = data.challenges
      .map((challenge) => {
        const completed =
          challenge.challengeProgress &&
          challenge.challengeProgress.length > 0 &&
          challenge.challengeProgress.every((progress) => progress.completed)
        return { ...challenge, completed }
      })
      .sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0))

    if (isPractice) {
      normalizedChallenges.forEach((challenge) => {
        challenge.completed = false
      })
    }

    logger.info("Exercise fetched successfully by lesson and number", {
      exerciseId,
      lessonId,
      exerciseNumber,
      isPractice,
      challengeCount: normalizedChallenges.length,
    })

    return { ...data, challenges: normalizedChallenges }
  }
)
