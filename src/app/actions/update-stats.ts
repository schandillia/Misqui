"use server"

import { auth } from "@/auth"
import { db } from "@/db/drizzle"
import { stats, userDrillCompletion } from "@/db/schema"
import { eq, and, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import app from "@/lib/data/app.json"
import { logger } from "@/lib/logger"

type UpdateStatsInput = {
  drillId: number
  subjectId: number
  isTimed: boolean
  pointsEarned?: number
  gemsEarned?: number
  questionsCompleted?: number
}

export const updateStats = async ({
  drillId,
  subjectId,
  isTimed,
  pointsEarned = 0,
  gemsEarned = 0,
  questionsCompleted = 0,
}: UpdateStatsInput) => {
  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("Unauthorized access attempt in updateStats")
    throw new Error("Unauthorized")
  }

  const userId = session.user.id

  try {
    // Fetch current stats
    const currentStats = await db
      .select({
        gems: stats.gems,
        points: stats.points,
      })
      .from(stats)
      .where(eq(stats.userId, userId))
      .limit(1)

    if (!currentStats[0]) {
      logger.warn("No stats found for user: %s", userId)
      throw new Error("User stats not found")
    }

    const currentGems = currentStats[0].gems
    const currentPoints = currentStats[0].points

    // Validate gems
    if (currentGems + gemsEarned < 0) {
      logger.warn("Insufficient gems for user: %s", userId)
      return { error: "gems" }
    }

    // Update stats table
    await db
      .update(stats)
      .set({
        gems: Math.min(currentGems + gemsEarned, app.GEMS_LIMIT),
        points: currentPoints + pointsEarned,
        updatedAt: new Date(),
      })
      .where(eq(stats.userId, userId))

    // Update user_drill_completion table
    if (questionsCompleted > 0) {
      await db
        .update(userDrillCompletion)
        .set({
          questionsCompleted: sql`${userDrillCompletion.questionsCompleted} + ${questionsCompleted}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(userDrillCompletion.userId, userId),
            eq(userDrillCompletion.subjectId, subjectId),
            eq(userDrillCompletion.currentDrillId, drillId)
          )
        )
    }

    // Revalidate relevant paths, excluding drill page
    revalidatePath("/learn")
    revalidatePath("/store")
    revalidatePath("/leaderboard")

    logger.info(
      "Stats updated successfully for user: %s, drill: %s",
      userId,
      drillId
    )
    return { success: true }
  } catch (error: any) {
    logger.error(
      "Error updating stats for user: %s, drill: %s, error: %O",
      userId,
      drillId,
      error
    )
    throw new Error("Failed to update stats")
  }
}
