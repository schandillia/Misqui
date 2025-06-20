"use server"

import { auth } from "@/auth"
import { db, initializeDb } from "@/db/drizzle"
import { users } from "@/db/schema"
import { logger } from "@/lib/logger"
import { eq } from "drizzle-orm"
import { soundPreferenceCache } from "@/db/queries/_all-queries"

interface SoundRequest {
  soundEnabled: boolean
}

export async function updateSound({ soundEnabled }: SoundRequest) {
  await initializeDb()
  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("No authenticated user found for sound setting update")
    throw new Error("Unauthorized")
  }

  if (typeof soundEnabled !== "boolean") {
    logger.error("Invalid soundEnabled value: %s", soundEnabled)
    throw new Error("Invalid sound setting")
  }

  try {
    const result = await db.instance
      .update(users)
      .set({ soundEnabled, updatedAt: new Date() })
      .where(eq(users.id, session.user.id))
      .returning({ updatedSoundEnabled: users.soundEnabled })

    if (!result.length) {
      logger.warn("No user found with ID: %s for sound setting update", {
        userId: session.user.id,
      })
      throw new Error("User not found")
    }

    // Invalidate cache for this user's sound preference
    const cacheKey = `soundPreference:${session.user.id}`
    soundPreferenceCache.delete(cacheKey)
    logger.info(
      `Invalidated sound preference cache for user: ${session.user.id}`,
      {
        module: "actions",
      }
    )

    logger.info(
      `Updated soundEnabled for user: ${session.user.id} to ${soundEnabled}`,
      {
        module: "actions",
      }
    )
    return { success: true, updatedSoundEnabled: result[0].updatedSoundEnabled }
  } catch (error) {
    logger.error("Failed to update sound setting", {
      error,
      userId: session.user.id,
    })
    throw new Error("Failed to update sound setting")
  }
}
