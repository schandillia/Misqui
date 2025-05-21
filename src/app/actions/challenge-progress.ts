"use server"

import { auth } from "@/auth"
import { db } from "@/db/drizzle"
import {
  getUserProgress,
  getUserSubscription,
  markExerciseCompleteAndUpdateStreak,
} from "@/db/queries"
import {
  challengeProgress,
  challenges,
  userProgress,
  exercises, // Added import
} from "@/db/schema"
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

  const exerciseId = challenge.exerciseId

  // Fetch the exercise to check if it's timed
  const exercise = await db.query.exercises.findFirst({
    where: eq(exercises.id, exerciseId),
  })

  if (!exercise) {
    logger.error("Exercise not found during progress upsert", { exerciseId })
    throw new Error("Exercise not found")
  }

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
      exerciseId,
    })
    await db
      .update(challengeProgress)
      .set({
        completed: true,
      })
      .where(eq(challengeProgress.id, existingChallengeProgress.id))

    await db
      .update(userProgress)
      .set(
        !exercise.isTimed
          ? {
              gems: Math.min(currentUserProgress.gems + 1, app.GEMS_LIMIT),
              points: currentUserProgress.points + 10,
            }
          : {} // Empty object if timed, so no update to points/gems
      )
      .where(eq(userProgress.userId, session.user.id))

    // Check if exercise is complete and update streak after updating progress
    await markExerciseCompleteAndUpdateStreak(session.user.id, exerciseId)

    revalidatePath("/learn")
    revalidatePath("/exercise")
    revalidatePath("/missions")
    revalidatePath("/leaderboard")
    revalidatePath(`/exercise/${exerciseId}`)

    logger.info("Practice challenge progress and rewards updated", {
      userId: session.user.id,
      challengeId,
      exerciseId,
    })
    return
  }

  // For non-practice (exercise mode), insert progress first
  await db.insert(challengeProgress).values({
    challengeId,
    userId: session.user.id,
    completed: true,
  })

  // Only update points if the exercise is not timed
  if (!exercise.isTimed) {
    await db
      .update(userProgress)
      .set({
        points: currentUserProgress.points + 10,
      })
      .where(eq(userProgress.userId, session.user.id))
  }

  // Check if exercise is complete and update streak after inserting progress
  await markExerciseCompleteAndUpdateStreak(session.user.id, exerciseId)

  revalidatePath("/learn")
  revalidatePath("/exercise")
  revalidatePath("/missions")
  revalidatePath("/leaderboard")
  revalidatePath(`/exercise/${exerciseId}`)

  logger.info("Challenge progress upserted and points updated", {
    userId: session.user.id,
    challengeId,
    exerciseId,
  })
}
