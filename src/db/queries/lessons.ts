import { cache } from "react"
import { db } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq, count } from "drizzle-orm"
import { lessons, challenges, challengeProgress } from "@/db/schema"
import { getCourseProgress } from "@/db/queries/user-progress"
import app from "@/lib/data/app.json" // Updated import

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

  // Count the total number of challenges for the lesson
  const challengeCountResult = await db
    .select({ count: count() })
    .from(challenges)
    .where(eq(challenges.lessonId, lessonId))

  const challengeCount = challengeCountResult[0]?.count || 0

  // Determine if we fetch all challenges or limit to app.CHALLENGES_PER_LESSON
  const fetchAllChallenges = challengeCount <= app.CHALLENGES_PER_LESSON

  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      challenges: {
        orderBy: (challenges, { asc }) => [asc(challenges.order)],
        ...(fetchAllChallenges ? {} : { limit: app.CHALLENGES_PER_LESSON }), // Apply limit if needed
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
