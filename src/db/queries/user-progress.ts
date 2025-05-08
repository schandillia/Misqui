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
import { logger } from "@/lib/logger"

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
  logger.info("Fetching user progress", { userId: session.user.id })
  try {
    const data = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, session.user.id),
      with: {
        activeCourse: true,
      },
    })
    if (!data) {
      logger.warn("User progress not found", { userId: session.user.id })
      return null
    }
    logger.info("User progress fetched", {
      userId: session.user.id,
      progress: data,
    })
    return {
      ...data,
      currentStreak: data.currentStreak || 0,
      longestStreak: data.longestStreak || 0,
    }
  } catch (error) {
    logger.error("Error fetching user progress", {
      userId: session.user.id,
      error,
    })
    throw error
  }
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
      lesson.id,
      "lesson"
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
    lessonId,
    "lesson"
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
        eq(userLessonChallengeSubset.lessonId, lessonId),
        eq(userLessonChallengeSubset.purpose, "lesson")
      )
    )
  // Generate and return a new one
  return await getOrCreateUserLessonChallengeSubset(userId, lessonId, "lesson")
}

export async function updateUserGems(userId: string, delta: number) {
  logger.info("Updating user gems", { userId, delta })
  try {
    const progress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
    })
    if (!progress) {
      logger.warn("User progress not found for gem update", { userId })
      return null
    }
    const newGems = Math.max(0, (progress.gems || 0) + delta)
    await db
      .update(userProgress)
      .set({ gems: newGems })
      .where(eq(userProgress.userId, userId))
    logger.info("User gems updated", { userId, newGems })
    return newGems
  } catch (error) {
    logger.error("Error updating user gems", { userId, error })
    throw error
  }
}

export async function updateUserPoints(userId: string, delta: number) {
  logger.info("Updating user points", { userId, delta })
  try {
    const progress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
    })
    if (!progress) {
      logger.warn("User progress not found for point update", { userId })
      return null
    }
    const newPoints = (progress.points || 0) + delta
    await db
      .update(userProgress)
      .set({ points: newPoints })
      .where(eq(userProgress.userId, userId))
    logger.info("User points updated", { userId, newPoints })
    return newPoints
  } catch (error) {
    logger.error("Error updating user points", { userId, error })
    throw error
  }
}

export async function updateUserStreak(userId: string) {
  try {
    const progress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
    })
    if (!progress) {
      logger.warn("User progress not found for streak update", { userId })
      return null
    }

    // Use local date for today
    const now = new Date()
    const todayStr =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0")

    const lastActivity = progress.lastActivityDate
      ? new Date(progress.lastActivityDate)
      : null

    let newStreak = progress.currentStreak
    let newLongestStreak = progress.longestStreak

    if (!lastActivity) {
      // First activity ever
      newStreak = 1
    } else {
      // Convert both dates to start of day for comparison
      const lastActivityDay = new Date(lastActivity)
      lastActivityDay.setHours(0, 0, 0, 0)
      const today = new Date(now)
      today.setHours(0, 0, 0, 0)

      // Calculate difference in days
      const diffTime = today.getTime() - lastActivityDay.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        // Same day, keep streak the same
        newStreak = progress.currentStreak || 0
      } else if (diffDays === 1) {
        // Yesterday, increment streak
        newStreak = (progress.currentStreak || 0) + 1
        // Update longest streak if current streak exceeds it
        if (newStreak > (progress.longestStreak || 0)) {
          newLongestStreak = newStreak
        }
      } else {
        // More than a day ago, reset streak
        newStreak = 1
      }
    }

    await db
      .update(userProgress)
      .set({
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastActivityDate: todayStr,
        updatedAt: new Date(),
      })
      .where(eq(userProgress.userId, userId))

    logger.info("User streak updated", {
      userId,
      newStreak,
      newLongestStreak,
      lastActivityDate: todayStr,
    })

    return { currentStreak: newStreak, longestStreak: newLongestStreak }
  } catch (error) {
    logger.error("Error updating user streak", { userId, error })
    throw error
  }
}

export async function getUserStreak(userId: string) {
  logger.info("Fetching user streak", { userId })
  try {
    const progress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
    })
    if (!progress) {
      logger.warn("User progress not found for streak fetch", { userId })
      return null
    }
    return {
      currentStreak: progress.currentStreak,
      longestStreak: progress.longestStreak,
      lastActivityDate: progress.lastActivityDate,
    }
  } catch (error) {
    logger.error("Error fetching user streak", { userId, error })
    throw error
  }
}

/**
 * Checks if all challenges in a lesson are completed for the user, and if so, updates the streak only if lastActivityDate is not today.
 */
export async function markLessonCompleteAndUpdateStreak(
  userId: string,
  lessonId: number
) {
  // Fetch user progress to check lastActivityDate
  const progress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  })
  if (!progress) {
    logger.warn("User progress not found for streak update", { userId })
    return
  }

  // Use local date for today
  const now = new Date()
  const todayStr =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0")

  if (progress.lastActivityDate === todayStr) {
    return // Already updated today
  }

  // Fetch the current subset of challenge IDs for this user and lesson
  const subsetIds = await getOrCreateUserLessonChallengeSubset(
    userId,
    lessonId,
    "lesson"
  )
  if (!subsetIds.length) {
    logger.warn("No subset found for lesson", { userId, lessonId })
    return
  }

  // Fetch challenge progress for the user for these subset challenges
  const progressList = await db.query.challengeProgress.findMany({
    where: and(
      eq(challengeProgress.userId, userId),
      inArray(challengeProgress.challengeId, subsetIds)
    ),
  })

  // If all subset challenges are completed
  const allCompleted = subsetIds.every((id) =>
    progressList.find((p) => p.challengeId === id && p.completed)
  )
  if (!allCompleted) {
    return
  }

  // Update streak
  await updateUserStreak(userId)
}
