import { cache } from "react"
import { db } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq } from "drizzle-orm"
import { userProgress } from "@/db/schema"

export const getUserProgress = cache(async () => {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, session.user.id),
    with: {
      activeCourse: true,
    },
  })
  return data
})

export const getCourses = cache(async () => {
  const data = await db.query.courses.findMany()

  return data
})
