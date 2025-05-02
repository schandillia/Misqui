import { cache } from "react"
import { db } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq } from "drizzle-orm"
import { userSubscription } from "@/db/schema"

const DAY_IN_MS = 86_400_000

export const getUserSubscription = cache(async () => {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  const data = await db.query.userSubscription.findFirst({
    where: eq(userSubscription.userId, session.user.id),
  })

  if (!data) return null

  const isActive =
    data.stripePriceId &&
    data.stripeCurrentPeriodEnd &&
    data.stripeCurrentPeriodEnd?.getTime() + DAY_IN_MS > Date.now()

  return {
    ...data,
    isActive: !!isActive,
  }
})
