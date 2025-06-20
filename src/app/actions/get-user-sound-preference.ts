"use server"

import { getUserData } from "@/db/queries"
import { logger } from "@/lib/logger"

export async function getSoundPreference() {
  try {
    const preference = await getUserData()
    if (!preference) {
      logger.error("Failed to fetch user data or preferences")
      return { soundEnabled: true }
    }
    return { soundEnabled: preference.soundEnabled }
  } catch (error) {
    logger.error("Failed to fetch sound preference", { error })
    return { soundEnabled: true }
  }
}
