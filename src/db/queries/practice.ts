import { cache } from "react"
import { db } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq, inArray } from "drizzle-orm"
import { exercises, challenges, challengeProgress } from "@/db/schema"
import { getOrCreateUserExerciseChallengeSubset } from "@/db/queries/exercises"
import app from "@/lib/data/app.json"
import { logger } from "@/lib/logger"

export const getPracticeExercise = cache(async (exerciseId: number) => {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  const subsetIds = await getOrCreateUserExerciseChallengeSubset(
    session.user.id,
    exerciseId,
    "practice"
  )

  const data = await db.query.exercises.findFirst({
    where: eq(exercises.id, exerciseId),
    with: {
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

  return { ...data, challenges: normalizedChallenges }
})

export async function getPracticeChallenges(
  exerciseId: number,
  userId: string
) {
  logger.info("Fetching practice challenges", { exerciseId, userId })
  try {
    const exercise = await db.query.exercises.findFirst({
      where: eq(exercises.id, exerciseId),
      with: {
        challenges: true,
      },
    })
    if (!exercise || !exercise.challenges) {
      logger.warn("Exercise or challenges not found for practice", {
        exerciseId,
      })
      return []
    }
    // Randomize challenges for practice
    const shuffled = exercise.challenges.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, app.CHALLENGES_PER_EXERCISE)
    logger.info("Practice challenges selected", {
      exerciseId,
      userId,
      challengeIds: selected.map((c) => c.id),
    })
    return selected
  } catch (error) {
    logger.error("Error fetching practice challenges", {
      exerciseId,
      userId,
      error,
    })
    throw error
  }
}
