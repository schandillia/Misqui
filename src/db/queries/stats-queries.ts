import { db, initializeDb } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq, desc } from "drizzle-orm"
import { stats, users } from "@/db/schema"
import { logger } from "@/lib/logger"
import app from "@/lib/data/app.json"

// Fetch user stats
export const getStats = async () => {
  await initializeDb()
  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("No authenticated user found for stats query", {
      module: "stats-queries",
    })
    return null
  }
  logger.info("Fetching user stats", {
    userId: session.user.id,
    module: "stats-queries",
  })
  try {
    const data = await db.instance.query.stats.findFirst({
      where: eq(stats.userId, session.user.id),
      with: {
        activeCourse: true,
      },
    })
    if (!data) {
      logger.warn("User stats not found", {
        userId: session.user.id,
        module: "stats-queries",
      })
      return null
    }
    logger.info("User stats fetched", {
      userId: session.user.id,
      stats: data,
      module: "stats-queries",
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
      module: "stats-queries",
    })
    throw error
  }
}

// Fetch leaderboard data
export const getLeaderboard = async (
  options: { topN?: number; requireAuth?: boolean } = {
    topN: app.LEADERBOARD_COUNT,
    requireAuth: false,
  }
) => {
  await initializeDb()
  const { topN = app.LEADERBOARD_COUNT, requireAuth = false } = options
  logger.info("Fetching leaderboard", {
    topN,
    requireAuth,
    module: "stats-queries",
  })

  const session = await auth()
  if (requireAuth && !session?.user?.id) {
    logger.warn("No authenticated user found for leaderboard query", {
      module: "stats-queries",
    })
    return []
  }

  try {
    const leaderboard = await db.instance
      .select({
        userId: stats.userId,
        points: stats.points,
        name: users.name,
        image: users.image,
      })
      .from(stats)
      .innerJoin(users, eq(stats.userId, users.id))
      .orderBy(desc(stats.points))
      .limit(topN)

    if (!leaderboard || leaderboard.length === 0) {
      logger.warn("No leaderboard data found", { module: "stats-queries" })
      return []
    }

    logger.info("Leaderboard fetched", {
      count: leaderboard.length,
      module: "stats-queries",
    })
    return leaderboard
  } catch (error) {
    logger.error("Error fetching leaderboard", {
      error,
      module: "stats-queries",
    })
    throw error
  }
}
