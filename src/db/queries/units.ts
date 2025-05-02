import { cache } from "react"
import { db } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq } from "drizzle-orm"
import { challengeProgress, units } from "@/db/schema"
import { getUserProgress } from "./user-progress"

export const getUnits = cache(async () => {
  const session = await auth()
  const userProgress = await getUserProgress()

  if (!session?.user?.id || !userProgress?.activeCourseId) {
    return []
  }

  const data = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, userProgress.activeCourseId),
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          challenges: {
            orderBy: (challenges, { asc }) => [asc(challenges.order)],
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, session.user.id),
              },
            },
          },
        },
      },
    },
  })

  const normalizedData = data.map((unit) => {
    const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {
      if (lesson.challenges.length === 0) {
        return { ...lesson, completed: false }
      }
      const allCompletedChallenges = lesson.challenges.every((challenge) => {
        return (
          challenge.challengeProgress &&
          challenge.challengeProgress.length > 0 &&
          challenge.challengeProgress.every((progress) => progress.completed)
        )
      })
      return { ...lesson, completed: allCompletedChallenges }
    })
    return { ...unit, lessons: lessonsWithCompletedStatus }
  })
  return normalizedData
})
