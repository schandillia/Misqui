"use server"

import { auth } from "@/auth"
import { db, initializeDb } from "@/db/drizzle"
import { users, brandColorEnum } from "@/db/schema"
import { logger } from "@/lib/logger"
import { eq } from "drizzle-orm"

interface ColorRequest {
  brandColor: (typeof brandColorEnum.enumValues)[number]
}

export async function updateColor({ brandColor }: ColorRequest) {
  await initializeDb()
  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("No authenticated user found for brand color update")
    throw new Error("Unauthorized")
  }

  if (!brandColorEnum.enumValues.includes(brandColor)) {
    logger.error("Invalid brand color value: %s", { brandColor })
    throw new Error("Invalid brand color")
  }

  try {
    const result = await db.instance
      .update(users)
      .set({ brandColor, updatedAt: new Date() })
      .where(eq(users.id, session.user.id))
      .returning({ updatedBrandColor: users.brandColor })

    if (!result.length) {
      logger.warn("No user found with ID: %s for brand color update", {
        userId: session.user.id,
      })
      throw new Error("User not found")
    }

    logger.info(
      `Updated brand color for user: ${session.user.id} to ${brandColor}`,
      {
        module: "actions",
      }
    )
    return { success: true, updatedBrandColor: result[0].updatedBrandColor }
  } catch (error) {
    logger.error(`Error updating brand color for user: ${session.user.id}`, {
      error,
      module: "actions",
    })
    throw new Error("Failed to update brand color")
  }
}
