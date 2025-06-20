"use server"

import { auth } from "@/auth"
import { db, initializeDb } from "@/db/drizzle"
import { users, themeEnum } from "@/db/schema"
import { logger } from "@/lib/logger"
import { eq } from "drizzle-orm"

interface ThemeRequest {
  theme: (typeof themeEnum.enumValues)[number]
}

export async function updateTheme({ theme }: ThemeRequest) {
  await initializeDb()
  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("No authenticated user found for theme update")
    throw new Error("Unauthorized")
  }

  if (!themeEnum.enumValues.includes(theme)) {
    logger.error("Invalid theme value: %s", { theme })
    throw new Error("Invalid theme")
  }

  try {
    const result = await db.instance
      .update(users)
      .set({ theme, updatedAt: new Date() })
      .where(eq(users.id, session.user.id))
      .returning({ updatedTheme: users.theme })

    if (!result.length) {
      logger.warn("No user found with ID: %s for theme update", {
        userId: session.user.id,
      })
      throw new Error("User not found")
    }

    logger.info(`Updated theme for user: ${session.user.id} to ${theme}`, {
      module: "actions",
    })
    return { success: true, updatedTheme: result[0].updatedTheme }
  } catch (error) {
    logger.error(`Error updating theme for user: ${session.user.id}`, {
      error,
      module: "actions",
    })
    throw new Error("Failed to update theme")
  }
}
