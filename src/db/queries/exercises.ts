import { cache } from "react"
import { db } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq, inArray, and } from "drizzle-orm"
import {
  exercises,
  challenges,
  challengeProgress,
  userExerciseChallengeSubset,
} from "@/db/schema"
import { getCourseProgress } from "@/db/queries"
import app from "@/lib/data/app.json"
import { logger } from "@/lib/logger"

export const getExercise = cache(
  async (id?: number, isPractice: boolean = false) => {
    logger.info("Fetching exercise", { id, isPractice })
    const session = await auth()
    const courseProgress = await getCourseProgress()

    if (!session?.user?.id) {
      logger.warn("No user session found when fetching exercise", {
        id,
        isPractice,
      })
      return null
    }

    const exerciseId = id || courseProgress?.activeExerciseId

    if (!exerciseId) {
      logger.warn("No exercise ID found when fetching exercise", {
        id,
        isPractice,
      })
      return null
    }

    const subsetIds = await getOrCreateUserExerciseChallengeSubset(
      session.user.id,
      exerciseId,
      isPractice
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
      logger.warn("Exercise not found or has no challenges", {
        exerciseId,
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

    logger.info("Exercise fetched successfully", {
      exerciseId,
      isPractice,
      challengeCount: normalizedChallenges.length,
    })

    return { ...data, challenges: normalizedChallenges }
  }
)

export async function getOrCreateUserExerciseChallengeSubset(
  userId: string,
  exerciseId: number,
  isPractice: boolean
) {
  // For practice mode, always generate a new subset
  if (isPractice) {
    logger.info("Generating new practice subset", { userId, exerciseId })
    const allChallenges = await db.query.challenges.findMany({
      where: eq(challenges.exerciseId, exerciseId),
    })
    const shuffled = allChallenges.sort(() => Math.random() - 0.5)
    const subset = shuffled
      .slice(0, app.CHALLENGES_PER_EXERCISE)
      .map((c) => c.id)

    // Upsert practice row
    await db
      .insert(userExerciseChallengeSubset)
      .values({
        userId,
        exerciseId,
        challengeIds: JSON.stringify(subset),
        isPractice: true,
      })
      .onConflictDoUpdate({
        target: [
          userExerciseChallengeSubset.userId,
          userExerciseChallengeSubset.exerciseId,
          userExerciseChallengeSubset.isPractice,
        ],
        set: {
          challengeIds: JSON.stringify(subset),
          isPractice: true,
        },
      })

    logger.info("Practice subset created and upserted", {
      userId,
      exerciseId,
      subset,
    })
    return subset
  }

  // For exercise mode, try to fetch existing subset first
  logger.info("Fetching existing exercise subset", {
    userId,
    exerciseId,
    isPractice: false,
  })
  const existing = await db.query.userExerciseChallengeSubset.findFirst({
    where: and(
      eq(userExerciseChallengeSubset.userId, userId),
      eq(userExerciseChallengeSubset.exerciseId, exerciseId),
      eq(userExerciseChallengeSubset.isPractice, false)
    ),
  })
  if (existing) {
    const subset = JSON.parse(existing.challengeIds) as number[]
    // Check if subset is valid (non-empty and contains valid challenge IDs)
    if (subset.length > 0) {
      const validChallenges = await db.query.challenges.findMany({
        where: inArray(challenges.id, subset),
      })
      if (validChallenges.length === subset.length) {
        logger.info("Found valid existing exercise subset", {
          userId,
          exerciseId,
          isPractice: false,
          subset,
        })
        return subset
      }
    }
    logger.warn("Invalid or empty subset found, regenerating", {
      userId,
      exerciseId,
      isPractice: false,
      subset,
    })
  }

  // Generate new random subset for exercise if no valid subset exists
  logger.info("Generating new exercise subset", {
    userId,
    exerciseId,
    isPractice: false,
  })
  const allChallenges = await db.query.challenges.findMany({
    where: eq(challenges.exerciseId, exerciseId),
  })
  if (allChallenges.length === 0) {
    logger.error("No challenges found for exercise", {
      userId,
      exerciseId,
      isPractice: false,
    })
    return []
  }
  const shuffled = allChallenges.sort(() => Math.random() - 0.5)
  const subset = shuffled.slice(0, app.CHALLENGES_PER_EXERCISE).map((c) => c.id)

  // Upsert in DB
  await db
    .insert(userExerciseChallengeSubset)
    .values({
      userId,
      exerciseId,
      challengeIds: JSON.stringify(subset),
      isPractice: false,
    })
    .onConflictDoUpdate({
      target: [
        userExerciseChallengeSubset.userId,
        userExerciseChallengeSubset.exerciseId,
        userExerciseChallengeSubset.isPractice,
      ],
      set: {
        challengeIds: JSON.stringify(subset),
        isPractice: false,
      },
    })

  logger.info("Exercise subset created and upserted", {
    userId,
    exerciseId,
    isPractice: false,
    subset,
  })
  return subset
}

export const getExerciseMetaByLessonAndNumber = cache(
  async (lessonId: number, exerciseNumber: number) => {
    logger.info("Fetching exercise meta by lesson and number", {
      lessonId,
      exerciseNumber,
    })
    const data = await db.query.exercises.findFirst({
      columns: {
        id: true,
        isTimed: true,
      },
      where: and(
        eq(exercises.lessonId, lessonId),
        eq(exercises.order, exerciseNumber) // Assuming 'exerciseNumber' corresponds to 'order'
      ),
    })

    if (!data) {
      logger.warn("Exercise meta not found for lesson and number", {
        lessonId,
        exerciseNumber,
      })
      return null
    }

    logger.info("Exercise meta fetched successfully", {
      lessonId,
      exerciseNumber,
      exerciseId: data.id,
      isTimed: data.isTimed,
    })
    return data
  }
)
