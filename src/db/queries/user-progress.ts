import { cache } from "react"
import { db } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq } from "drizzle-orm"
import { challengeProgress, units, userProgress } from "@/db/schema"
import { getLesson } from "./lessons" // Import getLesson

// Optional: Define an interface for the challenge type returned by getLesson
interface LessonChallenge {
  id: number
  lessonId: number
  challengeType: "SELECT" | "ASSIST"
  question: string
  order: number
  createdAt: Date
  updatedAt: Date
  completed: boolean
  challengeOptions?: { id: number; text: string; correct: boolean }[]
  challengeProgress?: {
    id: number
    userId: string
    challengeId: number
    completed: boolean
  }[]
}

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

export const getCourseProgress = cache(async () => {
  const session = await auth()
  const userProgress = await getUserProgress()

  if (!session?.user?.id || !userProgress?.activeCourseId) {
    return null
  }

  const unitsInActiveCourse = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, userProgress.activeCourseId),
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          unit: true,
          challenges: {
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

  const firstIncompleteLesson = unitsInActiveCourse
    .flatMap((unit) => unit.lessons)
    .find((lesson) => {
      return lesson.challenges.some((challenge) => {
        return (
          !challenge.challengeProgress ||
          challenge.challengeProgress.length === 0 ||
          challenge.challengeProgress.some(
            (progress) => progress.completed === false
          )
        )
      })
    })
  return {
    activeLesson: firstIncompleteLesson,
    activeLessonId: firstIncompleteLesson?.id,
  }
})

export const getLessonPercentage = cache(async () => {
  const courseProgress = await getCourseProgress()
  if (!courseProgress?.activeLessonId) {
    return 0
  }
  const lesson = await getLesson(courseProgress.activeLessonId)

  if (!lesson) {
    return 0
  }

  // Use type assertion or interface for lesson.challenges
  const completedChallenges = lesson.challenges.filter(
    (challenge: LessonChallenge) => challenge.completed
  )
  const percentage = Math.round(
    100 * (completedChallenges.length / lesson.challenges.length)
  )

  return percentage
})
