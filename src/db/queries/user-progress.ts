// src/db/queries/user-progress.ts
import { cache } from "react"
import { db } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq, inArray, and } from "drizzle-orm"
import {
  challengeProgress,
  units,
  userProgress,
  lessons,
  challenges,
  userLessonChallengeSubset,
} from "@/db/schema"
import { getLesson } from "@/db/queries/lessons"
import app from "@/lib/data/app.json"
import { getOrCreateUserLessonChallengeSubset } from "./lessons"

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

  const allLessons = unitsInActiveCourse
    .flatMap((unit) => unit.lessons)
    .sort((a, b) => a.order - b.order)

  let firstIncompleteLesson = undefined
  for (const lesson of allLessons) {
    const subsetIds = await getOrCreateUserLessonChallengeSubset(
      session.user.id,
      lesson.id
    )
    const subsetChallenges = lesson.challenges.filter((ch) =>
      subsetIds.includes(ch.id)
    )
    const isIncomplete = subsetChallenges.some(
      (challenge) =>
        !challenge.challengeProgress ||
        challenge.challengeProgress.length === 0 ||
        challenge.challengeProgress.some(
          (progress) => progress.completed === false
        )
    )
    if (isIncomplete) {
      firstIncompleteLesson = lesson
      break
    }
  }

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

  // Get the persisted subset
  const subsetIds = await getOrCreateUserLessonChallengeSubset(
    session.user.id,
    lessonId
  )

  // Fetch only those challenges
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      challenges: {
        where: inArray(challenges.id, subsetIds),
        with: {
          challengeProgress: {
            where: eq(challengeProgress.userId, session.user.id),
          },
        },
      },
    },
  })

  if (!lesson || !lesson.challenges) {
    return 0
  }

  const completedChallenges = lesson.challenges.filter(
    (challenge) =>
      challenge.challengeProgress &&
      challenge.challengeProgress.length > 0 &&
      challenge.challengeProgress.every((progress) => progress.completed)
  )

  // Use the subset length as denominator
  const percentage = Math.round(
    100 * (completedChallenges.length / subsetIds.length)
  )

  return percentage
}

export async function resetUserLessonChallengeSubset(
  userId: string,
  lessonId: number
) {
  // Delete the old subset
  await db
    .delete(userLessonChallengeSubset)
    .where(
      and(
        eq(userLessonChallengeSubset.userId, userId),
        eq(userLessonChallengeSubset.lessonId, lessonId)
      )
    )
  // Generate and return a new one
  return await getOrCreateUserLessonChallengeSubset(userId, lessonId)
}
