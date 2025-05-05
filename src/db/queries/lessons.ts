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

export const getLesson = cache(
  async (id?: number, purpose: "lesson" | "practice" = "lesson") => {
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

    return subset
  }

  // For lesson purpose, try to fetch existing subset first
  const existing = await db.query.userLessonChallengeSubset.findFirst({
    where: and(
      eq(userLessonChallengeSubset.userId, userId),
      eq(userLessonChallengeSubset.lessonId, lessonId),
      eq(userLessonChallengeSubset.purpose, purpose)
    ),
  })
  if (existing) {
    return JSON.parse(existing.challengeIds) as number[]
  }

  // Generate new random subset for lesson
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

  return subset
}
