import { cache } from "react"
import { db } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq } from "drizzle-orm"
import { lessons, challengeProgress } from "@/db/schema"
import { getCourseProgress } from "./user-progress"

export const getLesson = cache(async (id?: number) => {
  const session = await auth()
  const courseProgress = await getCourseProgress()

  if (!session?.user?.id) {
    return null
  }

  const lessonId = id || courseProgress?.activeLessonId

  if (!lessonId) {
    return null
  }

  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      challenges: {
        orderBy: (challenges, { asc }) => [asc(challenges.order)],
        with: {
          challengeOptions: true,
          challengeProgress: {
            where: eq(challengeProgress.userId, session.user.id),
          },
        },
      },
    },
  })

  if (!data || !data.challenges) {
    return null
  }

  const normalizedChallenges = data.challenges.map((challenge) => {
    const completed =
      challenge.challengeProgress &&
      challenge.challengeProgress.length > 0 &&
      challenge.challengeProgress.every((progress) => progress.completed)
    return { ...challenge, completed }
  })

  return { ...data, challenges: normalizedChallenges }
})
