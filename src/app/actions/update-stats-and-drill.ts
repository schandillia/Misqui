"use server"

import { db } from "@/db/drizzle"
import { stats, userDrillCompletion, drills } from "@/db/schema"
import { auth } from "@/auth"
import { eq, and, gt, sql } from "drizzle-orm"
import app from "@/lib/data/app.json"
import { logger } from "@/lib/logger"

// Define return type for clarity
type StatsAndDrillResult = {
  stats: { points: number; gems: number; questionsCompleted: number | null }
}

// Define input type
type UpdateStatsAndDrillParams = {
  userId: string
  isTimed: boolean
  isCurrent: boolean
  isCorrect: boolean
  pointsToAdd?: number
  gemsToAdd?: number
  subjectId: number
  currentDrillId: number
  incrementQuestionsCompleted?: boolean
}

// Update stats for points and gems based on drill context
export async function updateStatsAndDrill({
  userId,
  isTimed,
  isCurrent,
  isCorrect,
  pointsToAdd = 0,
  gemsToAdd = 0,
  subjectId,
  currentDrillId,
  incrementQuestionsCompleted = false,
}: UpdateStatsAndDrillParams): Promise<StatsAndDrillResult> {
  // Check authentication
  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("Unauthorized attempt to update stats and drill: no session")
    throw new Error("Unauthorized: No active session")
  }
  if (session.user.id !== userId) {
    logger.warn(
      "Unauthorized attempt to update stats for user %s by %s",
      userId,
      session.user.id
    )
    throw new Error("Unauthorized: User ID mismatch")
  }

  try {
    // Fetch initial stats for return value
    const initialStats = await db
      .select({ points: stats.points, gems: stats.gems })
      .from(stats)
      .where(eq(stats.userId, userId))
      .limit(1)
    if (!initialStats[0]) {
      throw new Error("No stats found for user")
    }

    // Handle stats upsert for points and gems
    if (isTimed || !isCorrect) {
      // For timed drills or incorrect answers in non-current drills, no upsert for individual questions
      if (isTimed || !isCurrent) {
        return { stats: { ...initialStats[0], questionsCompleted: null } }
      }
    }

    const gemsUpdate = isCurrent
      ? isCorrect
        ? sql`${stats.gems} + 0`
        : sql`GREATEST(0, ${stats.gems} - 1)`
      : sql`LEAST(${app.GEMS_LIMIT}, ${stats.gems} + ${gemsToAdd})`

    const updatedStats = await db
      .insert(stats)
      .values({
        userId,
        points: pointsToAdd,
        gems: isCurrent ? 0 : gemsToAdd,
      })
      .onConflictDoUpdate({
        target: stats.userId,
        set: {
          points: sql`${stats.points} + ${pointsToAdd}`,
          gems: gemsUpdate,
          updatedAt: new Date(),
        },
      })
      .returning({ points: stats.points, gems: stats.gems })

    if (!updatedStats[0]) {
      throw new Error("Failed to update stats")
    }

    logger.info(
      "Updated stats for user %s: points +%d, gems adjusted",
      userId,
      pointsToAdd
    )

    // Handle drill completion for non-timed, current drills
    let questionsCompleted: number | null = null
    if (!isTimed && isCurrent) {
      const currentCompletion = await db
        .select({ questionsCompleted: userDrillCompletion.questionsCompleted })
        .from(userDrillCompletion)
        .where(
          and(
            eq(userDrillCompletion.userId, userId),
            eq(userDrillCompletion.subjectId, subjectId),
            eq(userDrillCompletion.currentDrillId, currentDrillId)
          )
        )
        .limit(1)

      if (!currentCompletion[0]) {
        throw new Error("No drill completion record found for user")
      }

      questionsCompleted = currentCompletion[0].questionsCompleted || 0
      if (incrementQuestionsCompleted) {
        const updatedCompletion = await db
          .insert(userDrillCompletion)
          .values({
            userId,
            subjectId,
            currentDrillId,
            questionsCompleted: 1,
          })
          .onConflictDoUpdate({
            target: [
              userDrillCompletion.userId,
              userDrillCompletion.subjectId,
              userDrillCompletion.currentDrillId,
            ],
            set: {
              questionsCompleted: sql`${userDrillCompletion.questionsCompleted} + 1`,
              updatedAt: new Date(),
            },
          })
          .returning({
            questionsCompleted: userDrillCompletion.questionsCompleted,
          })

        if (!updatedCompletion[0]) {
          throw new Error("Failed to update drill completion")
        }

        questionsCompleted = updatedCompletion[0].questionsCompleted
        logger.info(
          "Incremented questions completed for user %s, subject %d, drill %d: %d",
          userId,
          subjectId,
          currentDrillId,
          questionsCompleted
        )
      }
    }

    return {
      stats: {
        points: updatedStats[0].points,
        gems: updatedStats[0].gems,
        questionsCompleted,
      },
    }
  } catch (error) {
    logger.error(
      "Error updating stats and drill for user %s: %O",
      userId,
      error
    )
    throw new Error("Failed to update stats and drill completion")
  }
}

// Reset questions completed and advance to next drill
export async function resetAndAdvanceDrill({
  userId,
  subjectId,
  currentDrillId,
}: {
  userId: string
  subjectId: number
  currentDrillId: number
}) {
  // Check authentication
  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("Unauthorized attempt to reset and advance drill: no session")
    throw new Error("Unauthorized: No active session")
  }
  if (session.user.id !== userId) {
    logger.warn(
      "Unauthorized attempt to reset drill for user %s by %s",
      userId,
      session.user.id
    )
    throw new Error("Unauthorized: User ID mismatch")
  }

  try {
    // Find the next drill for the subject
    const nextDrill = await db
      .select({ id: drills.id })
      .from(drills)
      .where(
        and(
          eq(
            drills.unitId,
            sql`(SELECT unit_id FROM drills WHERE id = ${currentDrillId})`
          ),
          gt(
            drills.order,
            sql`(SELECT "order" FROM drills WHERE id = ${currentDrillId})`
          )
        )
      )
      .orderBy(drills.order)
      .limit(1)

    const nextDrillId = nextDrill.length > 0 ? nextDrill[0].id : currentDrillId
    logger.info(
      "Advancing drill for user %s, subject %d: currentDrillId=%d, nextDrillId=%d",
      userId,
      subjectId,
      currentDrillId,
      nextDrillId
    )

    const updatedCompletion = await db
      .insert(userDrillCompletion)
      .values({
        userId,
        subjectId,
        currentDrillId: nextDrillId, // Use nextDrillId directly
        questionsCompleted: 0,
      })
      .onConflictDoUpdate({
        target: [userDrillCompletion.userId, userDrillCompletion.subjectId],
        set: {
          questionsCompleted: 0,
          currentDrillId: nextDrillId,
          updatedAt: new Date(),
        },
      })
      .returning({
        questionsCompleted: userDrillCompletion.questionsCompleted,
        currentDrillId: userDrillCompletion.currentDrillId,
      })

    logger.info(
      "Reset questions completed and advanced drill for user %s, subject %d to drill %d",
      userId,
      subjectId,
      nextDrillId
    )
    return updatedCompletion[0]
  } catch (error) {
    logger.error(
      "Error resetting and advancing drill for user %s: %O",
      userId,
      error
    )
    throw new Error("Failed to reset and advance drill")
  }
}

// Update stats for timed drill completion
export async function updateTimedDrillStats({
  userId,
  score,
}: {
  userId: string
  score: number
}) {
  // Check authentication
  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("Unauthorized attempt to update timed drill stats: no session")
    throw new Error("Unauthorized: No active session")
  }
  if (session.user.id !== userId) {
    logger.warn(
      "Unauthorized attempt to update stats for user %s by %s",
      userId,
      session.user.id
    )
    throw new Error("Unauthorized: User ID mismatch")
  }

  try {
    const pointsToAdd =
      score >= app.PASS_SCORE ? app.REWARD_POINTS_FOR_TIMED : 0

    const updatedStats = await db
      .insert(stats)
      .values({
        userId,
        points: pointsToAdd,
      })
      .onConflictDoUpdate({
        target: stats.userId,
        set: {
          points: sql`${stats.points} + ${pointsToAdd}`,
          updatedAt: new Date(),
        },
      })
      .returning({ points: stats.points, gems: stats.gems })

    logger.info(
      "Updated stats for timed drill for user %s: points +%d",
      userId,
      pointsToAdd
    )
    return updatedStats[0]
  } catch (error) {
    logger.error(
      "Error updating timed drill stats for user %s: %O",
      userId,
      error
    )
    throw new Error("Failed to update timed drill stats")
  }
}
