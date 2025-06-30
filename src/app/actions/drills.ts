"use server"

import { db, initializeDb } from "@/db/drizzle"
import { drills } from "@/db/schema"
import { auth } from "@/auth"
import { logger } from "@/lib/logger"
import { eq, desc } from "drizzle-orm"
import { NeonDbError } from "@neondatabase/serverless"
import { z } from "zod"
import { drillSchema } from "@/lib/schemas/drill"

// Define Drill type based on drills schema
type Drill = {
  id: number
  title: string
  unitId: number
  order: number
  drillNumber: number
  isTimed: boolean
  createdAt: Date
  updatedAt: Date
}

// Re-export Drill type for client components
export type { Drill }

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

// Extend drillSchema for server-side validation to include unitId
const drillServerSchema = drillSchema.extend({
  unitId: z.number().int().positive("Unit ID must be a positive integer"),
})

// Server action to fetch drills by unit ID
export async function getDrillsByUnitId(
  unitId: number
): Promise<ActionResponse<Drill[]>> {
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

    const fetchedDrills = await db.instance
      .select({
        id: drills.id,
        title: drills.title,
        unitId: drills.unitId,
        order: drills.order,
        drillNumber: drills.drillNumber,
        isTimed: drills.isTimed,
        createdAt: drills.createdAt,
        updatedAt: drills.updatedAt,
      })
      .from(drills)
      .where(eq(drills.unitId, unitId))
      .orderBy(desc(drills.order))

    logger.info("Drills fetched", { unitId, count: fetchedDrills.length })
    return { success: true, data: fetchedDrills }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("Error fetching drills:", {
      message: errorMessage,
      stack: errorStack,
    })
    logger.error("Error fetching drills", {
      unitId,
      message: errorMessage,
      stack: errorStack,
    })
    return {
      success: false,
      error: {
        code: 500,
        message: "Failed to fetch drills",
        details: errorStack,
      },
    }
  }
}

// Server action to add a new drill
export async function addDrill({
  unitId,
  title,
  isTimed,
}: {
  unitId: number
  title: string
  isTimed: boolean
}): Promise<ActionResponse<Drill>> {
  await initializeDb()
  try {
    logger.info("addDrill called with:", { unitId, title, isTimed })

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

    // Validate input with Zod
    const result = drillServerSchema.safeParse({ unitId, title, isTimed })
    if (!result.success) {
      logger.error("Validation failed for addDrill", {
        unitId,
        errors: result.error.errors,
      })
      return {
        success: false,
        error: {
          code: 400,
          message: "Invalid input data",
          details: result.error.errors.map((e) => e.message).join("; "),
        },
      }
    }

    // Calculate next drill_number and order
    const lastDrill = await db.instance
      .select({ drill_number: drills.drillNumber, order: drills.order })
      .from(drills)
      .where(eq(drills.unitId, unitId))
      .orderBy(desc(drills.order))
      .limit(1)

    logger.info("lastDrill query result:", { lastDrill })

    const nextDrillNumber = lastDrill[0]?.drill_number
      ? lastDrill[0].drill_number + 1
      : 1
    const nextOrder = lastDrill[0]?.order ? lastDrill[0].order + 1 : 1

    logger.info("Calculated values:", { nextDrillNumber, nextOrder })

    const insertValues = {
      unitId,
      title: title.trim(),
      isTimed,
      drillNumber: nextDrillNumber,
      order: nextOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    logger.info("Insert values:", insertValues)

    const newDrill = await db.instance
      .insert(drills)
      .values(insertValues)
      .returning({
        id: drills.id,
        title: drills.title,
        unitId: drills.unitId,
        order: drills.order,
        drillNumber: drills.drillNumber,
        isTimed: drills.isTimed,
        createdAt: drills.createdAt,
        updatedAt: drills.updatedAt,
      })

    logger.info("Database insert result:", { newDrill })

    if (!newDrill || newDrill.length === 0) {
      return {
        success: false,
        error: {
          code: 500,
          message: "Failed to create drill: No data returned from database",
        },
      }
    }

    logger.info("Drill added", { unitId, drillId: newDrill[0].id })
    return { success: true, data: newDrill[0] }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("Error adding drill:", {
      message: errorMessage,
      stack: errorStack,
    })

    // Handle duplicate key error specifically
    if (
      error instanceof NeonDbError &&
      error.message.includes(
        'duplicate key value violates unique constraint "drills_pkey"'
      )
    ) {
      logger.error("Duplicate key error adding drill", {
        unitId,
        message: errorMessage,
        stack: errorStack,
      })
      return {
        success: false,
        error: {
          code: 409,
          message:
            "Failed to add drill: Duplicate drill ID. Please contact support to reset the sequence.",
          details:
            "The database sequence for drill IDs may be out of sync. Run: SELECT setval('drills_id_seq', (SELECT MAX(id) + 1 FROM drills), false);",
        },
      }
    }

    logger.error("Error adding drill", {
      unitId,
      message: errorMessage,
      stack: errorStack,
    })
    return {
      success: false,
      error: {
        code: 500,
        message: `Failed to add drill: ${errorMessage}`,
        details: errorStack,
      },
    }
  }
}

// Server action to update an existing drill
export async function updateDrill({
  id,
  unitId,
  title,
  isTimed,
}: {
  id: number
  unitId: number
  title: string
  isTimed: boolean
}): Promise<ActionResponse<Drill>> {
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

    // Validate input with Zod
    const result = drillServerSchema.safeParse({ unitId, title, isTimed })
    if (!result.success) {
      logger.error("Validation failed for updateDrill", {
        unitId,
        id,
        errors: result.error.errors,
      })
      return {
        success: false,
        error: {
          code: 400,
          message: "Invalid input data",
          details: result.error.errors.map((e) => e.message).join("; "),
        },
      }
    }

    const updatedDrill = await db.instance
      .update(drills)
      .set({
        title,
        isTimed,
        updatedAt: new Date(),
      })
      .where(eq(drills.id, id))
      .returning({
        id: drills.id,
        title: drills.title,
        unitId: drills.unitId,
        order: drills.order,
        drillNumber: drills.drillNumber,
        isTimed: drills.isTimed,
        createdAt: drills.createdAt,
        updatedAt: drills.updatedAt,
      })

    if (!updatedDrill[0]) {
      return {
        success: false,
        error: { code: 404, message: "Drill not found" },
      }
    }

    logger.info("Drill updated", { unitId, drillId: id })
    return { success: true, data: updatedDrill[0] }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("Error updating drill:", {
      message: errorMessage,
      stack: errorStack,
    })
    logger.error("Error updating drill", {
      unitId,
      drillId: id,
      message: errorMessage,
      stack: errorStack,
    })
    return {
      success: false,
      error: {
        code: 500,
        message: `Failed to update drill: ${errorMessage}`,
        details: errorStack,
      },
    }
  }
}

// Server action to delete a drill
export async function deleteDrill(
  drillId: number
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

    await db.instance.delete(drills).where(eq(drills.id, drillId))
    logger.info("Drill deleted", { drillId })
    return { success: true, data: null }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("Error deleting drill:", {
      message: errorMessage,
      stack: errorStack,
    })
    logger.error("Error deleting drill", {
      drillId,
      message: errorMessage,
      stack: errorStack,
    })
    return {
      success: false,
      error: {
        code: 500,
        message: `Failed to delete drill: ${errorMessage}`,
        details: errorStack,
      },
    }
  }
}
