import { db, initializeDb } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq } from "drizzle-orm"
import { users, userSubscription } from "@/db/schema"
import { logger } from "@/lib/logger"

const DAY_IN_MS = 86_400_000

// Fetch the current user's subscription status
export async function getUserSubscription() {
  await initializeDb()

  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("No authenticated user found for subscription query")
    return null
  }

  try {
    const data = await db.instance.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, session.user.id),
    })

    if (!data) {
      logger.warn(`No subscription found for user: ${session.user.id}`, {
        module: "user-queries",
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
      module: "user-queries",
    })
    throw new Error("Failed to fetch user subscription")
  }
}

// Fetch user preferences and subscription status in a single query
export async function getUserData() {
  await initializeDb()

  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("No authenticated user found for user data query", {
      module: "user-queries",
    })
    return null
  }

  try {
    const data = await db.instance.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        theme: true,
        brandColor: true,
        soundEnabled: true,
      },
      with: {
        userSubscription: {
          columns: {
            stripePriceId: true,
            stripeCurrentPeriodEnd: true,
          },
        },
      },
    })

    if (!data) {
      logger.warn(`No user data found for user: ${session.user.id}`, {
        module: "user-queries",
      })
      return null
    }

    const subscription = data.userSubscription?.[0] || null
    const isActive =
      subscription?.stripePriceId &&
      subscription?.stripeCurrentPeriodEnd &&
      subscription.stripeCurrentPeriodEnd.getTime() + DAY_IN_MS > Date.now()

    return {
      theme: data.theme,
      brandColor: data.brandColor,
      soundEnabled: data.soundEnabled,
      subscription: subscription
        ? {
            ...subscription,
            isActive: !!isActive,
          }
        : null,
    }
  } catch (error) {
    logger.error(`Error fetching user data for user: ${session.user.id}`, {
      error,
      module: "user-queries",
    })
    throw new Error("Failed to fetch user data")
  }
}
