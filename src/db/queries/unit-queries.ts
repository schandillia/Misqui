import { cache } from "react"
import { db, initializeDb } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq, and } from "drizzle-orm"
import { units, drills, userDrillCompletion } from "@/db/schema"
import { logger } from "@/lib/logger"
import { UnitWithDrills } from "@/db/queries/types"
import { getStats } from "@/db/queries/stats-queries"

// Fetch all units with related drills and user drill completion, excluding notes
export const getUnits = cache(async () => {
  await initializeDb()
  const session = await auth()
  const stats = await getStats()

  if (!session?.user?.id || !stats?.activeCourseId) {
    logger.warn("No user or active course for units query", {
      userId: session?.user?.id,
      activeCourseId: stats?.activeCourseId,
      module: "unit-queries",
    })
    return []
  }

  logger.info("Fetching units for course", {
    activeCourseId: stats.activeCourseId,
    userId: session.user.id,
    module: "unit-queries",
  })
  try {
    const data = await db.instance
      .select({
        id: units.id,
        title: units.title,
        description: units.description,
        courseId: units.courseId,
        unitNumber: units.unitNumber,
        order: units.order,
        createdAt: units.createdAt,
        updatedAt: units.updatedAt,
        notes: units.notes,
        drills: {
          id: drills.id,
          title: drills.title,
          unitId: drills.unitId,
          order: drills.order,
          drillNumber: drills.drillNumber,
          isTimed: drills.isTimed,
          createdAt: drills.createdAt,
          updatedAt: drills.updatedAt,
        },
        currentDrillId: userDrillCompletion.currentDrillId,
        questionsCompleted: userDrillCompletion.questionsCompleted,
      })
      .from(units)
      .leftJoin(drills, eq(units.id, drills.unitId))
      .leftJoin(
        userDrillCompletion,
        and(
          eq(userDrillCompletion.userId, session.user.id),
          eq(userDrillCompletion.courseId, stats.activeCourseId)
        )
      )
      .where(eq(units.courseId, stats.activeCourseId))
      .orderBy(units.order)

    if (!data.length) {
      logger.warn("No units found for course", {
        activeCourseId: stats.activeCourseId,
        module: "unit-queries",
      })
      return []
    }

    // Group results by unit to handle multiple drills
    const groupedData = data.reduce(
      (acc, row) => {
        const unitId = row.id
        if (!acc[unitId]) {
          acc[unitId] = {
            id: row.id,
            title: row.title,
            description: row.description,
            courseId: row.courseId,
            unitNumber: row.unitNumber,
            order: row.order,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            notes: row.notes,
            drills: [],
            currentDrillId: row.currentDrillId,
            questionsCompleted: row.questionsCompleted,
          }
        }
        if (row.drills) {
          acc[unitId].drills.push(row.drills)
        }
        return acc
      },
      {} as Record<number, UnitWithDrills>
    )

    const result = Object.values(groupedData).sort((a, b) => a.order - b.order)

    logger.info("Units fetched for course", {
      activeCourseId: stats.activeCourseId,
      count: result.length,
      module: "unit-queries",
    })
    return result
  } catch (error) {
    logger.error("Error fetching units for course", {
      activeCourseId: stats.activeCourseId,
      error,
      module: "unit-queries",
    })
    throw error
  }
})

// Fetch notes for a specific unit
export const getNotes = cache(async (unitId: number) => {
  await initializeDb()
  logger.info("Fetching notes for unit", { unitId, module: "unit-queries" })
  try {
    const data = await db.instance.query.units.findFirst({
      where: eq(units.id, unitId),
      columns: {
        notes: true,
      },
    })
    logger.info("Notes fetched for unit", { unitId, module: "unit-queries" })
    return data?.notes || null
  } catch (error) {
    logger.error("Error fetching notes for unit", {
      unitId,
      error,
      module: "unit-queries",
    })
    throw error
  }
})

// Fetch units for a specific course by courseId
export const getUnitsByCourseId = cache(
  async (courseId: number, includeNotes: boolean = false) => {
    await initializeDb()
    logger.info("Fetching units for course", {
      courseId,
      includeNotes,
      module: "unit-queries",
    })
    try {
      const data = await db.instance
        .select({
          id: units.id,
          title: units.title,
          description: units.description,
          courseId: units.courseId,
          unitNumber: units.unitNumber,
          order: units.order,
          createdAt: units.createdAt,
          updatedAt: units.updatedAt,
          ...(includeNotes && { notes: units.notes }), // Conditionally include notes
        })
        .from(units)
        .where(eq(units.courseId, courseId))
        .orderBy(units.order)

      if (!data.length) {
        logger.warn("No units found for course", {
          courseId,
          module: "unit-queries",
        })
        return []
      }

      logger.info("Units fetched for course", {
        courseId,
        count: data.length,
        module: "unit-queries",
      })
      return data
    } catch (error) {
      logger.error("Error fetching units for course", {
        courseId,
        error,
        module: "unit-queries",
      })
      throw error
    }
  }
)
