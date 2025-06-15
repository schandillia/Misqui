// File: src/app/actions/check-drill-existence.ts
"use server"

import { db } from "@/db/drizzle"
import { courses, units, drills, stats, userDrillCompletion } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { logger } from "@/lib/logger"
import { cache } from "react"
import { auth } from "@/auth"

type CheckDrillResult = {
  exists: boolean
  drill: { id: number; title: string; isTimed: boolean } | null
  isCurrentDrill: boolean
  questionsCompleted: number | null
}

export const checkDrillExistence = cache(
  async (
    courseId: number,
    unitNumber: number,
    drillNumber: number
  ): Promise<CheckDrillResult> => {
    try {
      logger.info("Checking drill existence", {
        courseId,
        unitNumber,
        drillNumber,
      })

      // Get the authenticated user's session
      const session = await auth()
      if (!session?.user?.id) {
        logger.warn("No authenticated user for drill check", {
          courseId,
          unitNumber,
          drillNumber,
        })
        return {
          exists: false,
          drill: null,
          isCurrentDrill: false,
          questionsCompleted: null,
        }
      }

      // Fetch user's active course from stats table
      const userStats = await db
        .select({
          activeCourseId: stats.activeCourseId,
        })
        .from(stats)
        .where(eq(stats.userId, session.user.id))
        .limit(1)

      const activeCourseId = userStats[0]?.activeCourseId ?? null
      if (activeCourseId === null || activeCourseId !== courseId) {
        logger.warn("Drill does not belong to user's active course", {
          courseId,
          unitNumber,
          drillNumber,
          activeCourseId,
        })
        return {
          exists: false,
          drill: null,
          isCurrentDrill: false,
          questionsCompleted: null,
        }
      }

      // Check if drill exists and get its ID
      const result = await db
        .select({
          drillId: drills.id,
          drillTitle: drills.title,
          isTimed: drills.isTimed,
        })
        .from(drills)
        .innerJoin(units, eq(drills.unitId, units.id))
        .innerJoin(courses, eq(units.courseId, courses.id))
        .where(
          and(
            eq(courses.id, courseId),
            eq(units.unit_number, unitNumber),
            eq(drills.drill_number, drillNumber)
          )
        )
        .limit(1)

      if (result.length === 0) {
        logger.warn("Drill not found", { courseId, unitNumber, drillNumber })
        return {
          exists: false,
          drill: null,
          isCurrentDrill: false,
          questionsCompleted: null,
        }
      }

      const drillId = result[0].drillId
      const isTimed = result[0].isTimed

      // Fetch user's current drill and questions completed
      const completion = await db
        .select({
          currentDrillId: userDrillCompletion.currentDrillId,
          questionsCompleted: userDrillCompletion.questionsCompleted,
        })
        .from(userDrillCompletion)
        .where(
          and(
            eq(userDrillCompletion.userId, session.user.id),
            eq(userDrillCompletion.courseId, courseId)
          )
        )
        .limit(1)

      let questionsCompleted = 0 // Default to 0
      let isCurrentDrill = false

      if (completion.length && completion[0].currentDrillId) {
        const currentDrillId = completion[0].currentDrillId
        isCurrentDrill = currentDrillId === drillId
        // For timed drills, always return 0
        // For non-timed drills, use table value if current, else 0
        questionsCompleted = isTimed
          ? 0
          : isCurrentDrill
            ? completion[0].questionsCompleted
            : 0
      }

      // Fetch the unit number and drill number for the user's current drill
      const currentDrillData = await db
        .select({
          unitNumber: units.unit_number,
          drillNumber: drills.drill_number,
        })
        .from(drills)
        .innerJoin(units, eq(drills.unitId, units.id))
        .where(eq(drills.id, completion[0]?.currentDrillId ?? 0))
        .limit(1)

      if (completion.length && currentDrillData.length) {
        const currentUnitNumber = currentDrillData[0].unitNumber
        const currentDrillNumber = currentDrillData[0].drillNumber

        // Check if the requested unit is accessible
        if (unitNumber > currentUnitNumber) {
          logger.warn("Unit not accessible to user", {
            courseId,
            unitNumber,
            drillNumber,
            currentUnitNumber,
          })
          return {
            exists: false,
            drill: null,
            isCurrentDrill: false,
            questionsCompleted: null,
          }
        }

        // Check if the requested drill is accessible within the same unit
        if (
          unitNumber === currentUnitNumber &&
          drillNumber > currentDrillNumber
        ) {
          logger.warn("Drill not accessible to user", {
            courseId,
            unitNumber,
            drillNumber,
            currentDrillNumber,
          })
          return {
            exists: false,
            drill: null,
            isCurrentDrill: false,
            questionsCompleted: null,
          }
        }
      }

      logger.info("Drill found", {
        courseId,
        unitNumber,
        drillNumber,
        drillId,
        isCurrentDrill,
        questionsCompleted,
      })
      return {
        exists: true,
        drill: {
          id: result[0].drillId,
          title: result[0].drillTitle,
          isTimed: result[0].isTimed,
        },
        isCurrentDrill,
        questionsCompleted,
      }
    } catch (error) {
      logger.error("Error checking drill existence", {
        courseId,
        unitNumber,
        drillNumber,
        error,
      })
      throw new Error("Failed to check drill existence")
    }
  }
)
