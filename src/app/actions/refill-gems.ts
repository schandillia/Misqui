"use server"

import { db, initializeDb } from "@/db/drizzle"
import { getStats } from "@/db/queries"
import { stats } from "@/db/schema"
import app from "@/lib/data/app.json"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export const refillGems = async () => {
  await initializeDb()

  const currentUserStats = await getStats()

  if (!currentUserStats) throw new Error("User progress not found")

  if (currentUserStats.gems === app.GEMS_LIMIT)
    throw new Error("Gems are already full")

  if (currentUserStats.points < app.POINTS_TO_REFILL)
    throw new Error("Not enough points")

  await db.instance
    .update(stats)
    .set({
      gems: app.GEMS_LIMIT,
      points: currentUserStats.points - app.POINTS_TO_REFILL,
    })
    .where(eq(stats.userId, currentUserStats.userId))

  revalidatePath("/store")
  revalidatePath("/learn")
  revalidatePath("/missions")
  revalidatePath("/leaderboard")
}
