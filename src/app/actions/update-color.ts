"use server"

import { auth } from "@/auth"
import { brandColorEnum, users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { logger } from "@/lib/logger"
import { db, initializeDb } from "@/db/drizzle"
import { revalidateTag } from "next/cache"

interface ColorRequest {
  brandColor: (typeof brandColorEnum.enumValues)[number]
}

export async function updateColor({ brandColor }: ColorRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  if (!brandColorEnum.enumValues.includes(brandColor)) {
    logger.error("Invalid brand color value: %s", {
      brandColor,
      module: "update-color",
    })
    throw new Error("Invalid brand color value")
  }

  try {
    await initializeDb()
    const result = await db.instance
      .update(users)
      .set({ brandColor, updatedAt: new Date() })
      .where(eq(users.id, session.user.id))
      .returning({ updatedBrandColor: users.brandColor })

    if (!result.length) {
      logger.warn("No user found with ID: %s for brand color update", {
        userId: session.user.id,
        module: "update-color",
      })
      throw new Error("User not found")
    }

    // Invalidate cache for getUserPreferences
    revalidateTag(`preferences-${session.user.id}`)
    logger.info(
      `Updated brand color for user: ${session.user.id} to ${brandColor} and invalidated cache`,
      {
        module: "update-color",
      }
    )

    return { success: true, updatedBrandColor: result[0].updatedBrandColor }
  } catch (error) {
    logger.error(`Error updating brand color for user: ${session.user.id}`, {
      error,
      module: "update-color",
    })
    throw new Error("Failed to update brand color")
  }
}
