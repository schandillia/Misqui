// src/db/queries/units.ts
import { cache } from "react"
import { db } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq } from "drizzle-orm"
import { challengeProgress, units } from "@/db/schema"
import { getUserProgress } from "@/db/queries/user-progress"
import { getLessonPercentageForLesson } from "@/db/queries/user-progress"
import app from "@/lib/data/app.json"

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
            limit: app.CHALLENGES_PER_LESSON,
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

  // Compute percentages and completed status for each lesson
  const normalizedData = await Promise.all(
    data.map(async (unit) => {
      const lessonsWithCompletedStatus = await Promise.all(
        unit.lessons.map(async (lesson) => {
          // Use getLessonPercentageForLesson to compute the percentage
          const percentage = await getLessonPercentageForLesson(lesson.id)
          const completed = percentage === 100
          return { ...lesson, percentage, completed }
        })
      )
      return { ...unit, lessons: lessonsWithCompletedStatus }
    })
  )

  return normalizedData
})
