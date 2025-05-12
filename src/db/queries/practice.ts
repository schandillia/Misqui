import { cache } from "react"
import { db } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq, inArray } from "drizzle-orm"
import { lessons, challenges, challengeProgress } from "@/db/schema"
import { getOrCreateUserLessonChallengeSubset } from "@/db/queries/lessons"
import app from "@/lib/data/app.json"
import { logger } from "@/lib/logger"

export const getPracticeLesson = cache(async (lessonId: number) => {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  const subsetIds = await getOrCreateUserLessonChallengeSubset(
    session.user.id,
    lessonId,
    "practice"
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

export async function getPracticeChallenges(lessonId: number, userId: string) {
  logger.info("Fetching practice challenges", { lessonId, userId })
  try {
    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      with: {
        challenges: true,
      },
    })
    if (!lesson || !lesson.challenges) {
      logger.warn("Lesson or challenges not found for practice", { lessonId })
      return []
    }
    // Randomize challenges for practice
    const shuffled = lesson.challenges.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, app.CHALLENGES_PER_LESSON)
    logger.info("Practice challenges selected", {
      lessonId,
      userId,
      challengeIds: selected.map((c) => c.id),
    })
    return selected
  } catch (error) {
    logger.error("Error fetching practice challenges", {
      lessonId,
      userId,
      error,
    })
    throw error
  }
}
