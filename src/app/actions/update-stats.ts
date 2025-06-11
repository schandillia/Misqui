"use server"

import { auth } from "@/auth"
import { db } from "@/db/drizzle"
import { stats, userDrillCompletion, drills, units } from "@/db/schema"
import { eq, and, sql, gt } from "drizzle-orm"
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
    // Log input for debugging
    logger.info("updateStats called:", {
      userId,
      drillId,
      subjectId,
      isTimed,
      pointsEarned,
      gemsEarned,
      questionsCompleted,
    })

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
    if (questionsCompleted >= 0) {
      const isDrillCompleted = questionsCompleted === 0 // Indicates drill completion
      let updateFields: any = {
        updatedAt: new Date(),
      }

      // If drill is completed, check for next drill or unit
      if (isDrillCompleted && !isTimed) {
        // Fetch current drill's unitId
        const currentDrill = await db
          .select({ unitId: drills.unitId, order: drills.order })
          .from(drills)
          .where(eq(drills.id, drillId))
          .limit(1)

        logger.info("Current drill info:", {
          drillId,
          unitId: currentDrill[0]?.unitId,
          order: currentDrill[0]?.order,
        })

        if (!currentDrill[0]) {
          logger.warn("Drill not found: %s", drillId)
          throw new Error("Drill not found")
        }

        const unitId = currentDrill[0].unitId

        // Check for next drill in the same unit
        const nextDrillInUnit = await db
          .select({ id: drills.id, order: drills.order })
          .from(drills)
          .where(
            and(
              eq(drills.unitId, unitId),
              gt(drills.order, currentDrill[0].order)
            )
          )
          .orderBy(drills.order)
          .limit(1)

        logger.info("Next drill in unit query result:", {
          unitId,
          nextDrillId: nextDrillInUnit[0]?.id,
          nextDrillOrder: nextDrillInUnit[0]?.order,
        })

        if (nextDrillInUnit[0]) {
          updateFields.currentDrillId = nextDrillInUnit[0].id
          updateFields.questionsCompleted = 0
          logger.info(
            "Advancing to next drill in unit: %s for user: %s",
            nextDrillInUnit[0].id,
            userId
          )
        } else {
          // Check for next unit in the subject
          const currentUnit = await db
            .select({ order: units.order })
            .from(units)
            .where(eq(units.id, unitId))
            .limit(1)

          logger.info("Current unit info:", {
            unitId,
            order: currentUnit[0]?.order,
          })

          if (!currentUnit[0]) {
            logger.warn("Unit not found: %s", unitId)
            throw new Error("Unit not found")
          }

          const nextUnit = await db
            .select({ id: units.id, order: units.order })
            .from(units)
            .where(
              and(
                eq(units.subjectId, subjectId),
                gt(units.order, currentUnit[0].order)
              )
            )
            .orderBy(units.order)
            .limit(1)

          logger.info("Next unit query result:", {
            subjectId,
            nextUnitId: nextUnit[0]?.id,
            nextUnitOrder: nextUnit[0]?.order,
          })

          if (nextUnit[0]) {
            // Find the first drill in the next unit
            const firstDrillInNextUnit = await db
              .select({ id: drills.id, order: drills.order })
              .from(drills)
              .where(eq(drills.unitId, nextUnit[0].id))
              .orderBy(drills.order)
              .limit(1)

            logger.info("First drill in next unit query result:", {
              nextUnitId: nextUnit[0].id,
              firstDrillId: firstDrillInNextUnit[0]?.id,
              firstDrillOrder: firstDrillInNextUnit[0]?.order,
            })

            if (firstDrillInNextUnit[0]) {
              updateFields.currentDrillId = firstDrillInNextUnit[0].id
              updateFields.questionsCompleted = 0
              logger.info(
                "Advancing to first drill in next unit: %s for user: %s",
                firstDrillInNextUnit[0].id,
                userId
              )
            } else {
              updateFields.questionsCompleted = 0
              logger.info(
                "No drills found in next unit: %s for subject: %s",
                nextUnit[0].id,
                subjectId
              )
            }
          } else {
            logger.info(
              "No next unit found for subject: %s after unit: %s; preserving questions_completed",
              subjectId,
              unitId
            )
          }
        }
      } else if (!isTimed) {
        // For non-timed drills, increment questions_completed if not completed
        updateFields.questionsCompleted = sql`${userDrillCompletion.questionsCompleted} + ${questionsCompleted}`
      }

      logger.info("Updating user_drill_completion with fields:", {
        userId,
        subjectId,
        drillId,
        updateFields,
      })

      await db
        .update(userDrillCompletion)
        .set(updateFields)
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
