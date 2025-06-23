import { auth } from "@/auth"
import { db, initializeDb } from "@/db/drizzle"
import { userSubscription } from "@/db/schema"
import { logger } from "@/lib/logger"
import { eq } from "drizzle-orm"
import { cache } from "react"

const DAY_IN_MS = 86_400_000

export const getUserSubscription = cache(async (userId?: string) => {
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

  if (session.user.id !== userId) {
    logger.warn("No authenticated user found for subscription query")
    return null
  }

  try {
    const data = await db.instance.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, userId),
    })

    if (!data) {
      logger.warn(`No subscription found for user: ${userId}`, {
        module: "queries",
      })
      return null
    }

    const isActive =
      data.stripePriceId &&
      data.stripeCurrentPeriodEnd &&
      data.stripeCurrentPeriodEnd.getTime() + DAY_IN_MS > Date.now()

    return {
      ...data,
      isActive: !!isActive,
    }
  } catch (error) {
    logger.error(`Error fetching subscription for user: ${session.user.id}`, {
      error,
      module: "queries",
    })
    throw new Error("Failed to fetch user subscription")
  }
})
