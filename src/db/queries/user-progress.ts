// src/db/queries/user-progress.ts
import { cache } from "react"
import { db } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq } from "drizzle-orm"
import { challengeProgress, units, userProgress } from "@/db/schema"
import { getLesson } from "@/db/queries/lessons"
import app from "@/lib/data/app.json"

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

  const firstIncompleteLesson = unitsInActiveCourse
    .flatMap((unit) => unit.lessons)
    .find((lesson) => {
      const consideredChallenges = lesson.challenges.slice(
        0,
        app.CHALLENGES_PER_LESSON
      )
      return consideredChallenges.some((challenge) => {
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

  const completedChallenges = lesson.challenges.filter(
    (challenge: LessonChallenge) => challenge.completed
  )
  const percentage = Math.round(
    100 *
      (completedChallenges.length /
        Math.min(lesson.challenges.length, app.CHALLENGES_PER_LESSON))
  )

  return percentage
})

export const getLessonPercentageForLesson = async (lessonId: number) => {
  const session = await auth()
  if (!session?.user?.id) {
    return 0
  }

  const lesson = await getLesson(lessonId)
  if (!lesson) {
    return 0
  }

  const completedChallenges = lesson.challenges.filter(
    (challenge: LessonChallenge) => challenge.completed
  )
  const percentage = Math.round(
    100 *
      (completedChallenges.length /
        Math.min(lesson.challenges.length, app.CHALLENGES_PER_LESSON))
  )

  return percentage
}
