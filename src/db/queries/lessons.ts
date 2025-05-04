import { cache } from "react"
import { db } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq, count, inArray, and } from "drizzle-orm"
import {
  lessons,
  challenges,
  challengeProgress,
  userLessonChallengeSubset,
} from "@/db/schema"
import { getCourseProgress } from "@/db/queries/user-progress"
import app from "@/lib/data/app.json"

export const getLesson = cache(async (id?: number) => {
  const session = await auth()
  const courseProgress = await getCourseProgress()

  if (!session?.user?.id) {
    return null
  }

  const lessonId = id || courseProgress?.activeLessonId

  if (!lessonId) {
    return null
  }

  const subsetIds = await getOrCreateUserLessonChallengeSubset(
    session.user.id,
    lessonId
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

export async function getOrCreateUserLessonChallengeSubset(
  userId: string,
  lessonId: number
) {
  // 1. Try to fetch existing subset
  const existing = await db.query.userLessonChallengeSubset.findFirst({
    where: and(
      eq(userLessonChallengeSubset.userId, userId),
      eq(userLessonChallengeSubset.lessonId, lessonId)
    ),
  })
  if (existing) {
    return JSON.parse(existing.challengeIds) as number[]
  }

  // 2. Generate new random subset
  const allChallenges = await db.query.challenges.findMany({
    where: eq(challenges.lessonId, lessonId),
  })
  const shuffled = allChallenges.sort(() => Math.random() - 0.5)
  const subset = shuffled.slice(0, app.CHALLENGES_PER_LESSON).map((c) => c.id)

  // 3. Store in DB
  await db.insert(userLessonChallengeSubset).values({
    userId,
    lessonId,
    challengeIds: JSON.stringify(subset),
  })

  return subset
}
