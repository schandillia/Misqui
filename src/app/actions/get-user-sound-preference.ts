"use server"

import { getUserSoundPreference } from "@/db/queries"
import { logger } from "@/lib/logger"

export async function getSoundPreference() {
  try {
    const preference = await getUserSoundPreference()
    if (!preference) {
      return { soundEnabled: true } // Default to true if not found
    }
    return { soundEnabled: preference.soundEnabled }
  } catch (error) {
    logger.error("Failed to fetch sound preference", { error })
    return { soundEnabled: true } // Default to true on error
  }
}
