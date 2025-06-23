"use server"

import { auth } from "@/auth"
import { themeEnum, users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { logger } from "@/lib/logger"
import { db, initializeDb } from "@/db/drizzle"
import { revalidateTag } from "next/cache"

interface ThemeRequest {
  theme: (typeof themeEnum.enumValues)[number]
}

export async function updateTheme({ theme }: ThemeRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  if (!themeEnum.enumValues.includes(theme)) {
    logger.error("Invalid theme value: %s", { theme, module: "update-theme" })
    throw new Error("Invalid theme value")
  }

  try {
    await initializeDb()
    const result = await db.instance
      .update(users)
      .set({ theme, updatedAt: new Date() })
      .where(eq(users.id, session.user.id))
      .returning({ updatedTheme: users.theme })

    if (!result.length) {
      logger.warn("No user found with ID: %s for theme update", {
        userId: session.user.id,
        module: "update-theme",
      })
      throw new Error("User not found")
    }

    // Invalidate cache for getUserPreferences
    revalidateTag(`preferences-${session.user.id}`)
    logger.info(
      `Updated theme for user: ${session.user.id} to ${theme} and invalidated cache`,
      {
        module: "update-theme",
      }
    )

    return { success: true, updatedTheme: result[0].updatedTheme }
  } catch (error) {
    logger.error(`Error updating theme for user: ${session.user.id}`, {
      error,
      module: "update-theme",
    })
    throw new Error("Failed to update theme")
  }
}
