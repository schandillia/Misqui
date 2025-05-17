"use server"

import { auth } from "@/auth"
import { db } from "@/db/drizzle"
import {
  getCourseById,
  getUserProgress,
  getUserSubscription,
  markExerciseCompleteAndUpdateStreak,
} from "@/db/queries"
import { challengeProgress, challenges, userProgress } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import app from "@/lib/data/app.json"

export const upsertUserProgress = async (courseId: number) => {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const course = await getCourseById(courseId)

  if (!course) {
    throw new Error("Course not found")
  }

  if (!course.lessons.length || !course.lessons[0].exercises.length) {
    throw new Error("Course has no exercises")
  }

  const existingUserProgress = await getUserProgress()

  if (existingUserProgress) {
    await db.update(userProgress).set({
      activeCourseId: courseId,
    })

    revalidatePath("/learn")
    revalidatePath("/courses")
    return { success: true }
  }

  await db.insert(userProgress).values({
    userId: session.user.id,
    activeCourseId: courseId,
  })

  revalidatePath("/learn")
  revalidatePath("/courses")
  return { success: true }
}

export const reduceGems = async (challengeId: number) => {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const currentUserProgress = await getUserProgress()
  const userSubscription = await getUserSubscription()

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  })

  if (!challenge) throw new Error("Challenge not found")

  const exerciseId = challenge.exerciseId

  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, session.user.id),
      eq(challengeProgress.challengeId, challengeId)
    ),
  })

  const isPractice = !!existingChallengeProgress

  if (isPractice) return { error: "practice" }
  if (!currentUserProgress) throw new Error("User progress not found")
  if (userSubscription?.isActive) return { error: "subscription" }
  if (currentUserProgress.gems == 0) return { error: "gems" }

  await db
    .update(userProgress)
    .set({
      gems: Math.max(currentUserProgress.gems - 1, 0),
    })
    .where(eq(userProgress.userId, session.user.id))

  revalidatePath("/store")
  revalidatePath("/learn")
  revalidatePath("/missions")
  revalidatePath("/leaderboard")
  revalidatePath(`/exercise/${exerciseId}`)
}

export const refillGems = async () => {
  const currentUserProgress = await getUserProgress()

  if (!currentUserProgress) throw new Error("User progress not found")

  if (currentUserProgress.gems === app.GEMS_LIMIT)
    throw new Error("Gems are already full")

  if (currentUserProgress.points < app.POINTS_TO_REFILL)
    throw new Error("Not enough points")

  await db
    .update(userProgress)
    .set({
      gems: app.GEMS_LIMIT,
      points: currentUserProgress.points - app.POINTS_TO_REFILL,
    })
    .where(eq(userProgress.userId, currentUserProgress.userId))

  revalidatePath("/store")
  revalidatePath("/learn")
  revalidatePath("/missions")
  revalidatePath("/leaderboard")
}

export const updateStreakAfterExercise = async (exerciseId: number) => {
  const session = await auth()
  console.info(
    "SERVER: updateStreakAfterExercise called for",
    session?.user?.id,
    exerciseId
  )
  if (!session?.user?.id) throw new Error("Unauthorized")
  await markExerciseCompleteAndUpdateStreak(session.user.id, exerciseId)
  return { success: true }
}
