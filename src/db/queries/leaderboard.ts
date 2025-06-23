import { auth } from "@/auth"
import { db, initializeDb } from "@/db/drizzle"
import { questions, stats, users } from "@/db/schema"
import { logger } from "@/lib/logger"
import { desc, eq, sql } from "drizzle-orm"
import { cache } from "react"
import app from "@/lib/data/app.json"

export async function getLeaderboard(topN: number = app.LEADERBOARD_LENGTH) {
  await initializeDb()
  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("No authenticated user found for leaderboard query")
    return []
  }

  logger.info("Fetching leaderboard", { topN })
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
      logger.warn("No leaderboard data found", { topN })
      return []
    }
    logger.info("Leaderboard fetched", { count: leaderboard.length })
    return leaderboard
  } catch (error) {
    logger.error("Error fetching leaderboard", { error, topN })
    throw error
  }
}
