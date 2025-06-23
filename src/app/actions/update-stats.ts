"use server"

import { auth } from "@/auth"
import { db, initializeDb } from "@/db/drizzle"
import {
  stats,
  userDrillCompletion,
  drills,
  units,
  userCourseCompletion,
} from "@/db/schema"
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
  await initializeDb()

  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("Unauthorized access attempt in updateStats")
    throw new Error("Unauthorized")
  }

  const userId = session.user.id
  const today = new Date().toISOString().split("T")[0]

  try {
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

    const currentStats = await db.instance
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
      logger.warn(`No stats found for user: ${userId}`, { module: "units" })
      throw new Error("User stats not found")
    }

    const currentGems = currentStats[0].gems
    const currentPoints = currentStats[0].points
    const currentStreak = currentStats[0].currentStreak
    const longestStreak = currentStats[0].longestStreak
    const lastActivityDate = currentStats[0].lastActivityDate

    if (currentGems + gemsEarned < 0) {
      logger.warn(`Insufficient gems for user: ${userId}`, { module: "units" })
      return { error: "gems" }
    }

    let newCurrentStreak = currentStreak
    let newLongestStreak = longestStreak
    let newLastActivityDate = lastActivityDate

    if (isDrillCompleted) {
      const lastActivity = lastActivityDate ? new Date(lastActivityDate) : null
      const todayDate = new Date(today)

      if (
        lastActivity &&
        lastActivity < new Date(todayDate.getTime() - 24 * 60 * 60 * 1000)
      ) {
        newCurrentStreak = 0
        logger.info(`Streak reset to 0 for user: ${userId} due to inactivity`, {
          module: "units",
        })
      }

      if (!lastActivityDate || lastActivityDate !== today) {
        newCurrentStreak += 1
        newLastActivityDate = today
        newLongestStreak = Math.max(newCurrentStreak, longestStreak)
        logger.info(
          `Streak incremented to ${newCurrentStreak} for user: ${userId}`,
          {
            module: "units",
          }
        )
      }
    }

    const statsResult = await db.instance
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
    logger.info(
      `Updated ${statsResult.rowCount} rows in stats for user: ${userId}`,
      {
        module: "units",
      }
    )

    if (isCurrent && questionsCompleted >= 0) {
      const updateFields: UserDrillCompletionUpdateFields = {
        updatedAt: new Date(),
      }

      const currentCompletion = await db.instance
        .select({
          questionsCompleted: userDrillCompletion.questionsCompleted,
          currentDrillId: userDrillCompletion.currentDrillId,
        })
        .from(userDrillCompletion)
        .where(
          and(
            eq(userDrillCompletion.userId, userId),
            eq(userDrillCompletion.courseId, courseId)
          )
        )
        .limit(1)

      if (!currentCompletion[0]) {
        await db.instance.insert(userDrillCompletion).values({
          userId,
          courseId,
          currentDrillId: drillId,
          questionsCompleted: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        logger.info(
          `Created user_drill_completion record for user: ${userId}, course: ${courseId}, drill: ${drillId}`,
          { module: "units" }
        )
      }

      const currentQuestionsCompleted =
        currentCompletion[0]?.questionsCompleted || 0
      const currentDrillIdInDb = currentCompletion[0]?.currentDrillId || drillId

      if (currentDrillIdInDb !== drillId) {
        updateFields.currentDrillId = drillId
        logger.info(
          `Updating currentDrillId to ${drillId} for user: ${userId}, course: ${courseId}`,
          { module: "units" }
        )
      }

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
        const currentDrill = await db.instance
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
          logger.warn(`Drill not found: ${drillId}`, { module: "units" })
          throw new Error("Drill not found")
        }

        const unitId = currentDrill[0].unitId

        const nextDrillInUnit = await db.instance
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
            `Advancing to next drill in unit: ${nextDrillInUnit[0].id} for user: ${userId}`,
            { module: "units" }
          )
        } else {
          const currentUnit = await db.instance
            .select({ order: units.order })
            .from(units)
            .where(eq(units.id, unitId))
            .limit(1)

          logger.info("Current unit info:", {
            unitId,
            order: currentUnit[0]?.order,
          })

          if (!currentUnit[0]) {
            logger.warn(`Unit not found: ${unitId}`, { module: "units" })
            throw new Error("Unit not found")
          }

          const nextUnit = await db.instance
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
            const firstDrillInUnit = await db.instance
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
                `Advancing to first drill in next unit: ${firstDrillInUnit[0].id} for user: ${userId}`,
                { module: "units" }
              )
            } else {
              updateFields.questionsCompleted = 0
              logger.info(
                `No drills found in next unit: ${nextUnit[0].id} for course: ${courseId}`,
                { module: "units" }
              )
            }
          } else {
            updateFields.questionsCompleted = app.QUESTIONS_PER_DRILL
            logger.info(
              `No next unit found for course: ${courseId} after unit: ${unitId}; resetting questions`,
              { module: "units" }
            )

            // Insert course completion record
            await db.instance.insert(userCourseCompletion).values({
              userId,
              courseId,
            })
            logger.info(
              `Inserted user_course_completion record for user: ${userId}, course: ${courseId}`,
              { module: "units" }
            )
          }
        }
      } else if (!isTimed && questionsCompleted > 0) {
        updateFields.questionsCompleted = sql`${userDrillCompletion.questionsCompleted} + ${questionsCompleted}`
      } else if (isTimed && isCurrent) {
        updateFields.questionsCompleted = 0
      }

      logger.info("Updating user_drill_completion with fields:", {
        userId,
        courseId,
        drillId,
        updateFields: {
          updatedAt: updateFields.updatedAt,
          currentDrillId: updateFields.currentDrillId,
          questionsCompleted: updateFields.questionsCompleted
            ? String(updateFields.questionsCompleted)
            : undefined,
        },
      })

      const result = await db.instance
        .update(userDrillCompletion)
        .set(updateFields)
        .where(
          and(
            eq(userDrillCompletion.userId, userId),
            eq(userDrillCompletion.courseId, courseId)
          )
        )
        .returning({ updatedId: userDrillCompletion.userId })

      logger.info(`Updated user_drill_completion result:`, {
        userId,
        courseId,
        drillId,
        rowCount: result.length,
        updatedId: result[0]?.updatedId,
        module: "units",
      })

      if (result.length === 0) {
        logger.warn(
          `No rows updated in user_drill_completion for user: ${userId}, course: ${courseId}`,
          { module: "units" }
        )
        throw new Error("No user drill completion record found to update")
      }
    }

    revalidatePath("/learn")
    revalidatePath("/store")
    revalidatePath("/leaderboard")

    logger.info(
      `Stats updated successfully for user: ${userId}, drill: ${drillId}`,
      {
        module: "units",
      }
    )

    return { success: true }
  } catch (error: unknown) {
    logger.error(
      `Error updating stats for user: ${userId}, drill: ${drillId}`,
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        module: "units",
      }
    )
    throw new Error(
      `Failed to update stats: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

export const upsertStat = async (courseId: number) => {
  await initializeDb()

  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("Unauthorized access attempt in upsertStat")
    throw new Error("Unauthorized")
  }

  const userId = session.user.id
  const course = await getCourseById(courseId)

  if (!course) {
    logger.warn(`Course not found: ${courseId}`)
    throw new Error("Course not found")
  }

  if (!course.units.length || !course.units[0].drills.length) {
    logger.warn(`Course has no drills: ${courseId}`)
    throw new Error("Course has no drills")
  }

  const firstDrillId = course.units[0].drills[0].id

  // Update stats
  const existingUserStats = await db.instance.query.stats.findFirst({
    where: (stats, { eq }) => eq(stats.userId, userId),
  })

  if (existingUserStats) {
    await db.instance
      .update(stats)
      .set({
        activeCourseId: courseId,
        updatedAt: new Date(),
      })
      .where(eq(stats.userId, userId))
  } else {
    await db.instance.insert(stats).values({
      userId,
      activeCourseId: courseId,
    })
  }

  // Update user_drill_completion only if no record exists
  const existingCompletion = await db.instance
    .select()
    .from(userDrillCompletion)
    .where(
      and(
        eq(userDrillCompletion.userId, userId),
        eq(userDrillCompletion.courseId, courseId)
      )
    )
    .limit(1)

  if (!existingCompletion[0]) {
    await db.instance.insert(userDrillCompletion).values({
      userId,
      courseId,
      currentDrillId: firstDrillId,
      questionsCompleted: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    logger.info(
      `Initialized user_drill_completion for user: ${userId}, course: ${courseId}, drill: ${firstDrillId}`,
      {
        module: "courses",
      }
    )
  } else {
    logger.info(
      `Existing user_drill_completion found for user: ${userId}, course: ${courseId}, drill: ${existingCompletion[0].currentDrillId}, questionsCompleted: ${existingCompletion[0].questionsCompleted}`,
      { module: "courses" }
    )
  }

  revalidatePath("/learn")
  revalidatePath("/courses")
  return { success: true }
}
