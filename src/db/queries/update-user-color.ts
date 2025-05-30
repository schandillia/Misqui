import { db } from "@/db/drizzle"
import { users, brandColorEnum } from "@/db/schema"
import { eq } from "drizzle-orm"
import { logger } from "@/lib/logger"

export async function updateUserColor(
  userId: string,
  brandColor: (typeof brandColorEnum.enumValues)[number]
) {
  if (!brandColorEnum.enumValues.includes(brandColor)) {
    throw new Error("Invalid brand color value")
  }

  try {
    await db
      .update(users)
      .set({ brandColor, updatedAt: new Date() })
      .where(eq(users.id, userId))
    logger.info("Updated brand color for user %s to %s", userId, brandColor)
  } catch (error) {
    logger.error("Error updating brand color for user %s: %O", userId, error)
    throw error
  }
}
