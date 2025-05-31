import { db } from "@/db/drizzle"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { logger } from "@/lib/logger"

export async function updateUserSoundSetting(
  userId: string,
  soundEnabled: boolean
) {
  if (typeof soundEnabled !== "boolean") {
    throw new Error("Invalid soundEnabled value")
  }

  try {
    await db
      .update(users)
      .set({ soundEnabled, updatedAt: new Date() })
      .where(eq(users.id, userId))
    logger.info("Updated soundEnabled for user %s to %s", userId, soundEnabled)
  } catch (error) {
    logger.error("Error updating soundEnabled for user %s: %O", userId, error)
    throw error
  }
}
