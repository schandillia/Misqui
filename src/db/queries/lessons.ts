import { cache } from "react"
import { db } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq, inArray, and } from "drizzle-orm"
import {
  lessons,
  challenges,
  challengeProgress,
  userLessonChallengeSubset,
} from "@/db/schema"
import { getCourseProgress } from "@/db/queries/user-progress"
import app from "@/lib/data/app.json"
import { logger } from "@/lib/logger"

export const getLesson = cache(
  async (id?: number, purpose: "lesson" | "practice" = "lesson") => {
    logger.info("Fetching lesson", { id, purpose })
    const session = await auth()
    const courseProgress = await getCourseProgress()

    if (!session?.user?.id) {
      logger.warn("No user session found when fetching lesson", { id, purpose })
      return null
    }

    const lessonId = id || courseProgress?.activeLessonId

    if (!lessonId) {
      logger.warn("No lesson ID found when fetching lesson", { id, purpose })
      return null
    }

    const subsetIds = await getOrCreateUserLessonChallengeSubset(
      session.user.id,
      lessonId,
      purpose
    )

    const data = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
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
      logger.warn("Lesson not found or has no challenges", {
        lessonId,
        purpose,
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

    if (purpose === "practice") {
      normalizedChallenges.forEach((challenge) => {
        challenge.completed = false
      })
    }

    logger.info("Lesson fetched successfully", {
      lessonId,
      purpose,
      challengeCount: normalizedChallenges.length,
    })

    return { ...data, challenges: normalizedChallenges }
  }
)

export async function getOrCreateUserLessonChallengeSubset(
  userId: string,
  lessonId: number,
  purpose: "lesson" | "practice"
) {
  // For practice purpose, always generate a new subset
  if (purpose === "practice") {
    logger.info("Generating new practice subset", { userId, lessonId })
    const allChallenges = await db.query.challenges.findMany({
      where: eq(challenges.lessonId, lessonId),
    })
    const shuffled = allChallenges.sort(() => Math.random() - 0.5)
    const subset = shuffled.slice(0, app.CHALLENGES_PER_LESSON).map((c) => c.id)

    // Upsert practice row
    await db
      .insert(userLessonChallengeSubset)
      .values({
        userId,
        lessonId,
        challengeIds: JSON.stringify(subset),
        purpose,
      })
      .onConflictDoUpdate({
        target: [
          userLessonChallengeSubset.userId,
          userLessonChallengeSubset.lessonId,
          userLessonChallengeSubset.purpose,
        ],
        set: {
          challengeIds: JSON.stringify(subset),
        },
      })

    logger.info("Practice subset created and upserted", {
      userId,
      lessonId,
      subset,
    })
    return subset
  }

  // For lesson purpose, try to fetch existing subset first
  logger.info("Fetching existing lesson subset", { userId, lessonId, purpose })
  const existing = await db.query.userLessonChallengeSubset.findFirst({
    where: and(
      eq(userLessonChallengeSubset.userId, userId),
      eq(userLessonChallengeSubset.lessonId, lessonId),
      eq(userLessonChallengeSubset.purpose, purpose)
    ),
  })
  if (existing) {
    logger.info("Found existing lesson subset", { userId, lessonId, purpose })
    return JSON.parse(existing.challengeIds) as number[]
  }

  // Generate new random subset for lesson
  logger.info("Generating new lesson subset", { userId, lessonId, purpose })
  const allChallenges = await db.query.challenges.findMany({
    where: eq(challenges.lessonId, lessonId),
  })
  const shuffled = allChallenges.sort(() => Math.random() - 0.5)
  const subset = shuffled.slice(0, app.CHALLENGES_PER_LESSON).map((c) => c.id)

  // Upsert in DB
  await db
    .insert(userLessonChallengeSubset)
    .values({
      userId,
      lessonId,
      challengeIds: JSON.stringify(subset),
      purpose,
    })
    .onConflictDoUpdate({
      target: [
        userLessonChallengeSubset.userId,
        userLessonChallengeSubset.lessonId,
        userLessonChallengeSubset.purpose,
      ],
      set: {
        challengeIds: JSON.stringify(subset),
      },
    })

  logger.info("Lesson subset created and upserted", {
    userId,
    lessonId,
    purpose,
    subset,
  })
  return subset
}
