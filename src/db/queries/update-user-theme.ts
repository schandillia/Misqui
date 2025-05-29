import { db } from "@/db/drizzle"
import { users, themeEnum } from "@/db/schema"
import { eq } from "drizzle-orm"
import { logger } from "@/lib/logger"

export async function updateUserTheme(
  userId: string,
  theme: (typeof themeEnum.enumValues)[number]
) {
  if (!themeEnum.enumValues.includes(theme)) {
    throw new Error("Invalid theme value")
  }

  try {
    await db
      .update(users)
      .set({ theme, updatedAt: new Date() })
      .where(eq(users.id, userId))
    logger.info("Updated theme for user %s to %s", userId, theme)
  } catch (error) {
    logger.error("Error updating theme for user %s: %O", userId, error)
    throw error
  }
}
