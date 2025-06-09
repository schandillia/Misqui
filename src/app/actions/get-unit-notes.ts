"use server"

import { getNotes } from "@/db/queries"
import { logger } from "@/lib/logger"

export async function getUnitNotes(unitId: number) {
  try {
    const notes = await getNotes(unitId)
    if (!notes) {
      logger.warn("No notes found for unit", { unitId })
      return {
        notes: null,
        error: "No notes available for this unit",
      }
    }
    logger.info("Notes fetched successfully", { unitId })
    return {
      notes,
      error: null,
    }
  } catch (error) {
    logger.error("Failed to fetch unit notes", { unitId, error })
    return {
      notes: null,
      error: "Failed to load notes due to a server error",
    }
  }
}
