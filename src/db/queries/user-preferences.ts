import { auth } from "@/auth"
import { db, initializeDb } from "@/db/drizzle"
import { users } from "@/db/schema"
import { logger } from "@/lib/logger"
import { eq } from "drizzle-orm"
import { cache } from "react"

export const getUserPreferences = cache(async (userId: string) => {
  await initializeDb()

  if (!userId) {
    logger.warn("No user ID provided for subscription query")
    return null
  }

  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("No authenticated user found for subscription query")
    return null
  }

  try {
    const [user] = await db.instance
      .select({ theme: users.theme, brandColor: users.brandColor })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
    if (!user) {
      logger.warn(`No user found for preferences: ${userId}`, {
        module: "queries",
      })
      return null
    }
    return user
  } catch (error) {
    logger.error(`Error fetching preferences for user: ${userId}`, {
      error,
      module: "queries",
    })
    throw new Error("Failed to fetch user preferences")
  }
})
