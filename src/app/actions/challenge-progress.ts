"use server"

import { auth } from "@/auth"
import { db } from "@/db/drizzle"
import { getUserProgress, getUserSubscription } from "@/db/queries"
import { markLessonCompleteAndUpdateStreak } from "@/app/actions/user-progress"
import { challengeProgress, challenges, userProgress } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import app from "@/lib/data/app.json"
import { logger } from "@/lib/logger"

export const upsertChallengeProgress = async (
  challengeId: number,
  isTimed: boolean = false
) => {
  const session = await auth()
  logger.info("Attempting to upsert challenge progress", {
    userId: session?.user?.id,
    challengeId,
    isTimed,
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

    // Update points and gems only for non-timed lessons or practice mode
    if (!isTimed) {
      await db
        .update(userProgress)
        .set({
          gems: Math.min(currentUserProgress.gems + 1, app.GEMS_LIMIT),
          points: currentUserProgress.points + 10,
        })
        .where(eq(userProgress.userId, session.user.id))
    }

    if (!isTimed) {
      await markLessonCompleteAndUpdateStreak(session.user.id, lessonId)
    }

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

  // Update points only for non-timed lessons
  if (!isTimed) {
    await db
      .update(userProgress)
      .set({
        points: currentUserProgress.points + 10,
      })
      .where(eq(userProgress.userId, session.user.id))
  }

  if (!isTimed) {
    await markLessonCompleteAndUpdateStreak(session.user.id, lessonId)
  }

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
