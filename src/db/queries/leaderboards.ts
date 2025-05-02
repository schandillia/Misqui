import { cache } from "react"
import { db } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq, desc } from "drizzle-orm"
import { userProgress, users } from "@/db/schema"

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
