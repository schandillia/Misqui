import { cache } from "react"
import { db } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq, desc } from "drizzle-orm"
import { userProgress, users } from "@/db/schema"
import { logger } from "@/lib/logger"

export const getTopTenUsers = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return []
  const data = await db
    .select({
      userId: userProgress.userId,
      points: userProgress.points,
      name: users.name,
      image: users.image,
    })
    .from(userProgress)
    .innerJoin(users, eq(userProgress.userId, users.id))
    .orderBy(desc(userProgress.points))
    .limit(10)

  return data
})

export async function getLeaderboard(topN: number = 10) {
  logger.info("Fetching leaderboard", { topN })
  try {
    const leaderboard = await db.query.userProgress.findMany({
      orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
      limit: topN,
    })
    if (!leaderboard || leaderboard.length === 0) {
      logger.warn("No leaderboard data found")
      return []
    }
    logger.info("Leaderboard fetched", { count: leaderboard.length })
    return leaderboard
  } catch (error) {
    logger.error("Error fetching leaderboard", { error })
    throw error
  }
}
