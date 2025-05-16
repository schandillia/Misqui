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
import { getCourseProgress } from "@/db/queries"
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

    const lessonData = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      with: {
        challenges: {
          with: {
            challengeOptions: true,
            challengeProgress: {
              where: eq(challengeProgress.userId, session.user.id),
            },
          },
        },
      },
    })

    if (!lessonData || !lessonData.challenges) {
      logger.warn("Lesson not found or has no challenges", {
        lessonId,
        purpose,
      })
      return null
    }

    const isTimed = lessonData.isTimed
    const subsetIds = await getOrCreateUserLessonChallengeSubset(
      session.user.id,
      lessonId,
      purpose,
      isTimed
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
  purpose: "lesson" | "practice",
  isTimed: boolean = false
) {
  // For practice purpose or isTimed lessons that aren't fully completed, always generate a new subset
  if (purpose === "practice" || (isTimed && purpose === "lesson")) {
    const lessonData = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      with: {
        challenges: {
          with: {
            challengeProgress: {
              where: eq(challengeProgress.userId, userId),
            },
          },
        },
      },
    })

    if (!lessonData) {
      logger.error("Lesson not found when generating subset", {
        userId,
        lessonId,
        purpose,
      })
      return []
    }

    const completedChallenges = lessonData.challenges.filter(
      (challenge) =>
        challenge.challengeProgress &&
        challenge.challengeProgress.length > 0 &&
        challenge.challengeProgress.every((progress) => progress.completed)
    )

    // For isTimed lessons, only reuse the subset if the lesson is fully completed
    if (
      isTimed &&
      completedChallenges.length === lessonData.challenges.length
    ) {
      const existing = await db.query.userLessonChallengeSubset.findFirst({
        where: and(
          eq(userLessonChallengeSubset.userId, userId),
          eq(userLessonChallengeSubset.lessonId, lessonId),
          eq(userLessonChallengeSubset.purpose, purpose)
        ),
      })
      if (existing) {
        const subset = JSON.parse(existing.challengeIds) as number[]
        if (subset.length > 0) {
          const validChallenges = await db.query.challenges.findMany({
            where: inArray(challenges.id, subset),
          })
          if (validChallenges.length === subset.length) {
            logger.info(
              "Reusing existing subset for completed isTimed lesson",
              {
                userId,
                lessonId,
                purpose,
                subset,
              }
            )
            return subset
          }
        }
      }
    }

    // If isTimed and not fully completed, clear challengeProgress
    if (isTimed && completedChallenges.length < lessonData.challenges.length) {
      await db.delete(challengeProgress).where(
        and(
          eq(challengeProgress.userId, userId),
          inArray(
            challengeProgress.challengeId,
            lessonData.challenges.map((c) => c.id)
          )
        )
      )
      logger.info("Cleared challengeProgress for incomplete isTimed lesson", {
        userId,
        lessonId,
        purpose,
      })
    }

    logger.info("Generating new subset", { userId, lessonId, purpose, isTimed })
    const allChallenges = await db.query.challenges.findMany({
      where: eq(challenges.lessonId, lessonId),
    })
    const shuffled = allChallenges.sort(() => Math.random() - 0.5)
    const subset = shuffled.slice(0, app.CHALLENGES_PER_LESSON).map((c) => c.id)

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

    logger.info("Subset created and upserted", {
      userId,
      lessonId,
      purpose,
      isTimed,
      subset,
    })
    return subset
  }

  // For lesson purpose (non-isTimed), try to fetch existing subset first
  logger.info("Fetching existing lesson subset", { userId, lessonId, purpose })
  const existing = await db.query.userLessonChallengeSubset.findFirst({
    where: and(
      eq(userLessonChallengeSubset.userId, userId),
      eq(userLessonChallengeSubset.lessonId, lessonId),
      eq(userLessonChallengeSubset.purpose, purpose)
    ),
  })
  if (existing) {
    const subset = JSON.parse(existing.challengeIds) as number[]
    if (subset.length > 0) {
      const validChallenges = await db.query.challenges.findMany({
        where: inArray(challenges.id, subset),
      })
      if (validChallenges.length === subset.length) {
        logger.info("Found valid existing lesson subset", {
          userId,
          lessonId,
          purpose,
          subset,
        })
        return subset
      }
    }
    logger.warn("Invalid or empty subset found, regenerating", {
      userId,
      lessonId,
      purpose,
      subset,
    })
  }

  // Generate new random subset for lesson if no valid subset exists
  logger.info("Generating new lesson subset", { userId, lessonId, purpose })
  const allChallenges = await db.query.challenges.findMany({
    where: eq(challenges.lessonId, lessonId),
  })
  if (allChallenges.length === 0) {
    logger.error("No challenges found for lesson", {
      userId,
      lessonId,
      purpose,
    })
    return []
  }
  const shuffled = allChallenges.sort(() => Math.random() - 0.5)
  const subset = shuffled.slice(0, app.CHALLENGES_PER_LESSON).map((c) => c.id)

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
