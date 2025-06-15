"use server"

import { auth } from "@/auth"
import { db } from "@/db/drizzle"
import { stats, userDrillCompletion, drills, units } from "@/db/schema"
import { getCourseById } from "@/db/queries"
import { eq, and, sql, gt, SQL } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import app from "@/lib/data/app.json"
import { logger } from "@/lib/logger"

type UpdateStatsInput = {
  drillId: number
  courseId: number
  isTimed: boolean
  pointsEarned?: number
  gemsEarned?: number
  questionsCompleted?: number
  isDrillCompleted?: boolean
  isCurrent?: boolean
  scorePercentage?: number
}

// Type for the updateFields object
type UserDrillCompletionUpdateFields = {
  updatedAt: Date
  currentDrillId?: number
  questionsCompleted?: number | SQL<unknown>
}

export const updateStats = async ({
  drillId,
  courseId,
  isTimed,
  pointsEarned = 0,
  gemsEarned = 0,
  questionsCompleted = 0,
  isDrillCompleted = false,
  isCurrent = false,
  scorePercentage = 0,
}: UpdateStatsInput) => {
  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("Unauthorized access attempt in updateStats")
    throw new Error("Unauthorized")
  }

  const userId = session.user.id
  const today = new Date().toISOString().split("T")[0]

  try {
    // Log input for debugging
    logger.info("updateStats called:", {
      userId,
      drillId,
      courseId,
      isTimed,
      pointsEarned,
      gemsEarned,
      questionsCompleted,
      isDrillCompleted,
      isCurrent,
      scorePercentage,
    })

    // Fetch current stats
    const currentStats = await db
      .select({
        gems: stats.gems,
        points: stats.points,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        lastActivityDate: stats.lastActivityDate,
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
    const currentStreak = currentStats[0].currentStreak
    const longestStreak = currentStats[0].longestStreak
    const lastActivityDate = currentStats[0].lastActivityDate

    // Validate gems
    if (currentGems + gemsEarned < 0) {
      logger.warn("Insufficient gems for user: %s", userId)
      return { error: "gems" }
    }

    // Calculate streak updates
    let newCurrentStreak = currentStreak
    let newLongestStreak = longestStreak
    let newLastActivityDate = lastActivityDate

    if (isDrillCompleted) {
      const lastActivity = lastActivityDate ? new Date(lastActivityDate) : null
      const todayDate = new Date(today)

      // Check if streak should be reset (more than one day since last activity)
      if (
        lastActivity &&
        lastActivity < new Date(todayDate.getTime() - 24 * 60 * 60 * 1000)
      ) {
        newCurrentStreak = 0
        logger.info("Streak reset to 0 for user: %s due to inactivity", userId)
      }

      // Increment streak if it's the first completion today
      if (!lastActivityDate || lastActivityDate !== today) {
        newCurrentStreak += 1
        newLastActivityDate = today
        newLongestStreak = Math.max(newCurrentStreak, longestStreak)
        logger.info(
          "Streak incremented to %d for user: %s",
          newCurrentStreak,
          userId
        )
      }
    }

    // Update stats table
    await db
      .update(stats)
      .set({
        gems: Math.min(currentGems + gemsEarned, app.GEMS_LIMIT),
        points: currentPoints + pointsEarned,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActivityDate: newLastActivityDate,
        updatedAt: new Date(),
      })
      .where(eq(stats.userId, userId))

    // Update user_drill_completion table
    if (questionsCompleted >= 0) {
      const updateFields: UserDrillCompletionUpdateFields = {
        updatedAt: new Date(),
      }

      // Fetch current questionsCompleted for the drill
      const currentCompletion = await db
        .select({
          questionsCompleted: userDrillCompletion.questionsCompleted,
        })
        .from(userDrillCompletion)
        .where(
          and(
            eq(userDrillCompletion.userId, userId),
            eq(userDrillCompletion.courseId, courseId),
            eq(userDrillCompletion.currentDrillId, drillId)
          )
        )
        .limit(1)

      const currentQuestionsCompleted =
        currentCompletion[0]?.questionsCompleted || 0

      // Determine if drill should be advanced
      const shouldAdvanceDrill =
        (!isTimed &&
          (isDrillCompleted ||
            currentQuestionsCompleted + questionsCompleted >=
              app.QUESTIONS_PER_DRILL)) ||
        (isTimed &&
          isCurrent &&
          scorePercentage === app.PASS_SCORE &&
          isDrillCompleted)

      if (shouldAdvanceDrill) {
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
          // Check for next unit in the course
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
                eq(units.courseId, courseId),
                gt(units.order, currentUnit[0].order)
              )
            )
            .orderBy(units.order)
            .limit(1)

          logger.info("Next unit query result:", {
            courseId,
            nextUnitId: nextUnit[0]?.id,
            nextUnitOrder: nextUnit[0]?.order,
          })

          if (nextUnit[0]) {
            // Find the first drill in the next unit
            const firstDrillInUnit = await db
              .select({ id: drills.id, order: drills.order })
              .from(drills)
              .where(eq(drills.unitId, nextUnit[0].id))
              .orderBy(drills.order)
              .limit(1)

            logger.info("First drill in next unit query result:", {
              nextUnitId: nextUnit[0].id,
              firstDrillId: firstDrillInUnit[0]?.id,
              firstDrillOrder: firstDrillInUnit[0]?.order,
            })

            if (firstDrillInUnit[0]) {
              updateFields.currentDrillId = firstDrillInUnit[0].id
              updateFields.questionsCompleted = 0
              logger.info(
                "Advancing to first drill in next unit: %s for user: %s",
                firstDrillInUnit[0].id,
                userId
              )
            } else {
              updateFields.questionsCompleted = 0
              logger.info(
                "No drills found in next unit: %s for course: %s",
                nextUnit[0].id,
                courseId
              )
            }
          } else {
            updateFields.questionsCompleted = 0
            logger.info(
              "No next unit found for course: %s after unit: %s; resetting questions_completed",
              courseId,
              unitId
            )
          }
        }
      } else if (!isTimed && questionsCompleted > 0) {
        // For non-timed drills, increment questions_completed if not completed
        updateFields.questionsCompleted = sql`${userDrillCompletion.questionsCompleted} + ${questionsCompleted}`
      } else if (isTimed && isCurrent) {
        // For timed drills, reset questionsCompleted to 0 since we don't track progress
        updateFields.questionsCompleted = 0
      }

      logger.info("Updating user_drill_completion with fields:", {
        userId,
        courseId,
        drillId,
        updateFields,
      })

      await db
        .update(userDrillCompletion)
        .set(updateFields)
        .where(
          and(
            eq(userDrillCompletion.userId, userId),
            eq(userDrillCompletion.courseId, courseId),
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
  } catch (error: unknown) {
    logger.error(
      "Error updating stats for user: %s, drill: %s, error: %O",
      userId,
      drillId,
      error
    )
    throw new Error("Failed to update stats")
  }
}

export const upsertStat = async (courseId: number) => {
  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("Unauthorized access attempt in upsertStat")
    throw new Error("Unauthorized")
  }

  const course = await getCourseById(courseId)

  if (!course) {
    logger.warn("Course not found: %s", courseId)
    throw new Error("Course not found")
  }

  if (!course.units.length || !course.units[0].drills.length) {
    logger.warn("Course has no drills: %s", courseId)
    throw new Error("Course has no drills")
  }

  const existingUserStats = await db.query.stats.findFirst({
    where: (stats, { eq }) => eq(stats.userId, session.user.id),
  })

  if (existingUserStats) {
    await db
      .update(stats)
      .set({
        activeCourseId: courseId,
        updatedAt: new Date(),
      })
      .where(eq(stats.userId, session.user.id))

    revalidatePath("/learn")
    revalidatePath("/courses")
    return { success: true }
  }

  await db.insert(stats).values({
    userId: session.user.id,
    activeCourseId: courseId,
  })

  revalidatePath("/learn")
  revalidatePath("/courses")
  return { success: true }
}
