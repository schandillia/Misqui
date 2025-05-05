"use server"

import { auth } from "@/auth"
import { db } from "@/db/drizzle"
import {
  getUserProgress,
  getUserSubscription,
  markLessonCompleteAndUpdateStreak,
} from "@/db/queries"
import { challengeProgress, challenges, userProgress } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import app from "@/lib/data/app.json"
import { logger } from "@/lib/logger"

export const upsertChallengeProgress = async (challengeId: number) => {
  const session = await auth()
  logger.info("Attempting to upsert challenge progress", {
    userId: session?.user?.id,
    challengeId,
  })

  if (!session?.user?.id) {
    logger.error("Unauthorized challenge progress upsert attempt", {
      challengeId,
    })
    throw new Error("Unauthorized")
  }

  const currentUserProgress = await getUserProgress()
  const userSubscription = await getUserSubscription()

  if (!currentUserProgress) {
    logger.error("User progress not found during challenge progress upsert", {
      userId: session.user.id,
      challengeId,
    })
    throw new Error("User progress not found")
  }

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  })

  if (!challenge) {
    logger.error("Challenge not found during progress upsert", { challengeId })
    throw new Error("Challenge not found")
  }

  const lessonId = challenge.lessonId

  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, session.user.id),
      eq(challengeProgress.challengeId, challengeId)
    ),
  })

  const isPractice = !!existingChallengeProgress

  if (
    currentUserProgress.gems === 0 &&
    !isPractice &&
    !userSubscription?.isActive
  ) {
    logger.warn("Insufficient gems for challenge progress", {
      userId: session.user.id,
      challengeId,
    })
    return { error: "gems" }
  }

  // Update streak only if the lesson is fully completed
  await markLessonCompleteAndUpdateStreak(session.user.id, lessonId)

  if (isPractice) {
    logger.info("Practice challenge completed", {
      userId: session.user.id,
      challengeId,
      lessonId,
    })
    await db
      .update(challengeProgress)
      .set({
        completed: true,
      })
      .where(eq(challengeProgress.id, existingChallengeProgress.id))

    await db
      .update(userProgress)
      .set({
        gems: Math.min(currentUserProgress.gems + 1, app.GEMS_LIMIT),
        points: currentUserProgress.points + 10,
      })
      .where(eq(userProgress.userId, session.user.id))

    revalidatePath("/learn")
    revalidatePath("/lesson")
    revalidatePath("/missions")
    revalidatePath("/leaderboard")
    revalidatePath(`/lesson/${lessonId}`)

    logger.info("Practice challenge progress and rewards updated", {
      userId: session.user.id,
      challengeId,
      lessonId,
    })
    return
  }

  await db.insert(challengeProgress).values({
    challengeId,
    userId: session.user.id,
    completed: true,
  })

  await db
    .update(userProgress)
    .set({
      points: currentUserProgress.points + 10,
    })
    .where(eq(userProgress.userId, session.user.id))

  revalidatePath("/learn")
  revalidatePath("/lesson")
  revalidatePath("/missions")
  revalidatePath("/leaderboard")
  revalidatePath(`/lesson/${lessonId}`)

  logger.info("Challenge progress upserted and points updated", {
    userId: session.user.id,
    challengeId,
    lessonId,
  })
}
