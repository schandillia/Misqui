import { auth } from "@/auth"
import { db, initializeDb } from "@/db/drizzle"
import { stats } from "@/db/schema"
import { logger } from "@/lib/logger"
import { eq } from "drizzle-orm"
import { cache } from "react"

export const getStats = cache(async () => {
  await initializeDb()
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }
  logger.info("Fetching user stats", { userId: session.user.id })
  try {
    const data = await db.instance.query.stats.findFirst({
      where: eq(stats.userId, session.user.id),
      with: {
        activeCourse: true,
      },
    })
    if (!data) {
      logger.warn("User stats not found", { userId: session.user.id })
      return null
    }
    logger.info("User stats fetched", {
      userId: session.user.id,
      stats: data,
    })
    return {
      ...data,
      currentStreak: data.currentStreak || 0,
      longestStreak: data.longestStreak || 0,
    }
  } catch (error) {
    logger.error("Error fetching user stats", {
      userId: session.user.id,
      error,
    })
    throw error
  }
})
