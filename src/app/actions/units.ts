"use server"

import { db, initializeDb } from "@/db/drizzle"
import { units } from "@/db/schema"
import { auth } from "@/auth"
import { logger } from "@/lib/logger"
import { getUnitsByCourseId as fetchUnitsByCourseId } from "@/db/queries"
import { eq, desc } from "drizzle-orm"
import type { Unit } from "@/db/queries/types"
import { NeonDbError } from "@neondatabase/serverless"

// Re-export Unit type for client components
export type { Unit }

// Define a type for the response
type ActionResponse<T> = {
  success: boolean
  data?: T
  error?: {
    code: number
    message: string
    details?: string
  }
}

// Server action to fetch units by course ID
export async function getUnitsByCourseId(
  courseId: number
): Promise<ActionResponse<Unit[]>> {
  await initializeDb()
  try {
    const session = await auth()
    if (!session?.user) {
      return {
        success: false,
        error: { code: 401, message: "Unauthorized: Please log in" },
      }
    }
    if (session.user.role !== "admin") {
      return {
        success: false,
        error: { code: 403, message: "Forbidden: Admin access required" },
      }
    }

    const fetchedUnits = await fetchUnitsByCourseId(courseId, true) // Pass includeNotes: true
    // Map to ensure camelCase and type safety
    const unitsData: Unit[] = fetchedUnits.map((unit) => ({
      id: unit.id,
      title: unit.title,
      description: unit.description,
      courseId: unit.courseId,
      unitNumber: unit.unitNumber,
      order: unit.order,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
      notes: unit.notes ?? null,
    }))

    const sortedUnits = unitsData.sort((a, b) => b.order - a.order)

    return { success: true, data: sortedUnits }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("Error fetching units:", {
      message: errorMessage,
      stack: errorStack,
    })
    logger.error("Error fetching units", {
      courseId,
      message: errorMessage,
      stack: errorStack,
    })
    return {
      success: false,
      error: {
        code: 500,
        message: "Failed to fetch units",
        details: errorStack,
      },
    }
  }
}

// Server action to add a new unit
export async function addUnit({
  courseId,
  title,
  description,
  notes,
}: {
  courseId: number
  title: string
  description: string
  notes?: string | null
}): Promise<ActionResponse<Unit>> {
  await initializeDb()
  try {
    logger.info("addUnit called with:", { courseId, title, description, notes })

    const session = await auth()
    if (!session?.user) {
      return {
        success: false,
        error: { code: 401, message: "Unauthorized: Please log in" },
      }
    }
    if (session.user.role !== "admin") {
      return {
        success: false,
        error: { code: 403, message: "Forbidden: Admin access required" },
      }
    }

    // Validate required fields
    if (!courseId || !title || !description) {
      return {
        success: false,
        error: {
          code: 400,
          message:
            "Missing required fields: courseId, title, and description are required",
        },
      }
    }

    // Calculate next unit_number and order
    const lastUnit = await db.instance
      .select({ unit_number: units.unitNumber, order: units.order })
      .from(units)
      .where(eq(units.courseId, courseId))
      .orderBy(desc(units.order))
      .limit(1)

    logger.info("lastUnit query result:", { lastUnit })

    const nextUnitNumber = lastUnit[0]?.unit_number
      ? lastUnit[0].unit_number + 1
      : 1
    const nextOrder = lastUnit[0]?.order ? lastUnit[0].order + 1 : 1

    logger.info("Calculated values:", { nextUnitNumber, nextOrder })

    const insertValues = {
      courseId,
      title: title.trim(),
      description: description.trim(),
      notes: typeof notes === "string" ? notes.trim() : null,
      unitNumber: nextUnitNumber,
      order: nextOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    logger.info("Insert values:", insertValues)

    const newUnit = await db.instance
      .insert(units)
      .values(insertValues)
      .returning({
        id: units.id,
        title: units.title,
        description: units.description,
        courseId: units.courseId,
        unitNumber: units.unitNumber,
        order: units.order,
        createdAt: units.createdAt,
        updatedAt: units.updatedAt,
        notes: units.notes,
      })

    logger.info("Database insert result:", { newUnit })

    if (!newUnit || newUnit.length === 0) {
      return {
        success: false,
        error: {
          code: 500,
          message: "Failed to create unit: No data returned from database",
        },
      }
    }

    logger.info("Unit added", { courseId, unitId: newUnit[0].id })
    return { success: true, data: newUnit[0] }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("Error adding unit:", {
      message: errorMessage,
      stack: errorStack,
    })

    // Handle duplicate key error specifically
    if (
      error instanceof NeonDbError &&
      error.message.includes(
        'duplicate key value violates unique constraint "units_pkey"'
      )
    ) {
      logger.error("Duplicate key error adding unit", {
        courseId,
        message: errorMessage,
        stack: errorStack,
      })
      return {
        success: false,
        error: {
          code: 409,
          message:
            "Failed to add unit: Duplicate unit ID. Please contact support to reset the sequence.",
          details:
            "The database sequence for unit IDs may be out of sync. Run: SELECT setval('units_id_seq', (SELECT MAX(id) + 1 FROM units), false);",
        },
      }
    }

    logger.error("Error adding unit", {
      courseId,
      message: errorMessage,
      stack: errorStack,
    })
    return {
      success: false,
      error: {
        code: 500,
        message: `Failed to add unit: ${errorMessage}`,
        details: errorStack,
      },
    }
  }
}

// Server action to update an existing unit
export async function updateUnit({
  id,
  courseId,
  title,
  description,
  notes,
}: {
  id: number
  courseId: number
  title: string
  description: string
  notes: string | null
}): Promise<ActionResponse<Unit>> {
  await initializeDb()
  try {
    const session = await auth()
    if (!session?.user) {
      return {
        success: false,
        error: { code: 401, message: "Unauthorized: Please log in" },
      }
    }
    if (session.user.role !== "admin") {
      return {
        success: false,
        error: { code: 403, message: "Forbidden: Admin access required" },
      }
    }

    const updatedUnit = await db.instance
      .update(units)
      .set({
        title,
        description,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(units.id, id))
      .returning({
        id: units.id,
        title: units.title,
        description: units.description,
        courseId: units.courseId,
        unitNumber: units.unitNumber,
        order: units.order,
        createdAt: units.createdAt,
        updatedAt: units.updatedAt,
        notes: units.notes,
      })

    if (!updatedUnit[0]) {
      return {
        success: false,
        error: { code: 404, message: "Unit not found" },
      }
    }

    logger.info("Unit updated", { courseId, unitId: id })
    return { success: true, data: updatedUnit[0] }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("Error updating unit:", {
      message: errorMessage,
      stack: errorStack,
    })
    logger.error("Error updating unit", {
      courseId,
      unitId: id,
      message: errorMessage,
      stack: errorStack,
    })
    return {
      success: false,
      error: {
        code: 500,
        message: `Failed to update unit: ${errorMessage}`,
        details: errorStack,
      },
    }
  }
}

// Server action to delete a unit
export async function deleteUnit(
  unitId: number
): Promise<ActionResponse<null>> {
  await initializeDb()
  try {
    const session = await auth()
    if (!session?.user) {
      return {
        success: false,
        error: { code: 401, message: "Unauthorized: Please log in" },
      }
    }
    if (session.user.role !== "admin") {
      return {
        success: false,
        error: { code: 403, message: "Forbidden: Admin access required" },
      }
    }

    await db.instance.delete(units).where(eq(units.id, unitId))
    logger.info("Unit deleted", { unitId })
    return { success: true, data: null }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("Error deleting unit:", {
      message: errorMessage,
      stack: errorStack,
    })
    logger.error("Error deleting unit", {
      unitId,
      message: errorMessage,
      stack: errorStack,
    })
    return {
      success: false,
      error: {
        code: 500,
        message: `Failed to delete unit: ${errorMessage}`,
        details: errorStack,
      },
    }
  }
}
