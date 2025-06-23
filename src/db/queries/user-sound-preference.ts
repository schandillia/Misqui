import { auth } from "@/auth"
import { db, initializeDb } from "@/db/drizzle"
import { users } from "@/db/schema"
import { logger } from "@/lib/logger"
import { eq } from "drizzle-orm"
import { cache } from "react"

export const getUserSoundPreference = cache(async () => {
  await initializeDb()

  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("No authenticated user found for sound preference query")
    return null
  }

  try {
    const result = await db.instance
      .select({ soundEnabled: users.soundEnabled })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    if (!result.length) {
      logger.warn("No user found", { userId: session.user.id })
      return null
    }

    return result[0]
  } catch (error) {
    logger.error(
      `Error fetching sound preference for user: ${session.user.id}`,
      {
        error,
        module: "queries",
      }
    )
    throw new Error("Failed to fetch sound preference")
  }
})
