"use server"

import { auth } from "@/auth"
import { db } from "@/db/drizzle"
import { getUserProgress } from "@/db/queries" // Assuming this fetches all necessary fields including points
import { exercises, userProgress } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import app from "@/lib/data/app.json"
import { logger } from "@/lib/logger"

export const awardTimedExerciseReward = async (
  exerciseId: number,
  scorePercentage: number
) => {
  const session = await auth()
  logger.info("Attempting to award timed exercise reward", {
    userId: session?.user?.id,
    exerciseId,
    scorePercentage,
  })

  if (!session?.user?.id) {
    logger.error("Unauthorized timed exercise reward attempt", {
      exerciseId,
      scorePercentage,
    })
    throw new Error("Unauthorized")
  }

  const currentUserProgress = await getUserProgress()

  if (!currentUserProgress) {
    logger.error("User progress not found for timed exercise reward", {
      userId: session.user.id,
      exerciseId,
    })
    throw new Error("User progress not found")
  }

  const exercise = await db.query.exercises.findFirst({
    where: eq(exercises.id, exerciseId),
  })

  if (!exercise) {
    logger.error("Exercise not found for timed exercise reward", {
      exerciseId,
      userId: session.user.id,
    })
    throw new Error("Exercise not found")
  }

  if (exercise.isTimed) {
    if (scorePercentage === 100) {
      logger.info("Awarding points for 100% timed exercise", {
        userId: session.user.id,
        exerciseId,
        pointsToAdd: app.REWARD_POINTS_FOR_TIMED,
      })
      await db
        .update(userProgress)
        .set({
          points: currentUserProgress.points + app.REWARD_POINTS_FOR_TIMED,
        })
        .where(eq(userProgress.userId, session.user.id))

      revalidatePath("/learn")
      revalidatePath("/leaderboard")
      revalidatePath("/missions") // Added missions as it might be affected by points
      revalidatePath(`/exercise/${exerciseId}`) // Specific exercise path
      // Note: /quests might also be relevant if points contribute to quests

      logger.info("Timed exercise reward points updated successfully", {
        userId: session.user.id,
        exerciseId,
      })
      return { success: true, pointsAwarded: app.REWARD_POINTS_FOR_TIMED }
    } else {
      logger.info(
        "No reward for timed exercise, score not 100%",
        { userId: session.user.id, exerciseId, scorePercentage }
      )
      // No points or gems are modified if score is less than 100%
      return { success: true, pointsAwarded: 0 }
    }
  } else {
    logger.warn("Attempted to award reward for non-timed exercise", {
      userId: session.user.id,
      exerciseId,
    })
    return { error: "not_timed_exercise", pointsAwarded: 0 }
  }

  // This part should ideally not be reached if the logic above covers all cases.
  // However, to satisfy the structure, if it's a non-timed exercise and no error was thrown before,
  // it implies success but no points specific to "timed reward".
  // Given the 'else' block for non-timed exercise returns, this is more of a fallback.
  return { success: true, pointsAwarded: 0 }
}
