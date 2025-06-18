import { cache } from "react"
import { db, initializeDb } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq, and, sql, desc } from "drizzle-orm"
import {
  users,
  userSubscription,
  themeEnum,
  brandColorEnum,
  courses,
  stats,
  units,
  userDrillCompletion,
  drills,
  questions,
} from "@/db/schema"
import { logger } from "@/lib/logger"
import { UnitWithDrills } from "@/db/queries/types"

const DAY_IN_MS = 86_400_000

// Fetch the current user's subscription status
export const getUserSubscription = cache(async () => {
  await initializeDb()

  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("No authenticated user found for subscription query")
    return null
  }

  try {
    const data = await db.instance.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, session.user.id),
    })

    if (!data) {
      logger.warn(`No subscription found for user: ${session.user.id}`, {
        module: "queries",
      })
      return null
    }

    const isActive =
      data.stripePriceId &&
      data.stripeCurrentPeriodEnd &&
      data.stripeCurrentPeriodEnd.getTime() + DAY_IN_MS > Date.now()

    return {
      ...data,
      isActive: !!isActive,
    }
  } catch (error) {
    logger.error(`Error fetching subscription for user: ${session.user.id}`, {
      error,
      module: "queries",
    })
    throw new Error("Failed to fetch user subscription")
  }
})

// Fetch the current user's sound preference
export async function getUserSoundPreference() {
  await initializeDb()

  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("No authenticated user found for sound preference query")
    return null
  }

  try {
    const result = await db.instance
      .select({ soundEnabled: users.soundEnabled })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    if (!result.length) {
      logger.warn("No user found", { userId: session.user.id })
      return null
    }

    return result[0]
  } catch (error) {
    logger.error(
      `Error fetching sound preference for user: ${session.user.id}`,
      {
        error,
        module: "queries",
      }
    )
    throw new Error("Failed to fetch sound preference")
  }
}

// Update the sound setting for a given user
export async function updateUserSoundSetting(
  userId: string,
  soundEnabled: boolean
) {
  await initializeDb()
  if (typeof soundEnabled !== "boolean") {
    logger.error("Invalid soundEnabled value: %s", soundEnabled)
    throw new Error("Sound preference must be a boolean value")
  }

  try {
    const result = await db.instance
      .update(users)
      .set({ soundEnabled, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({ updatedSoundEnabled: users.soundEnabled })

    if (!result.length) {
      logger.warn("No user found with ID: %s for sound setting update", {
        userId,
      })
      throw new Error("User not found")
    }

    logger.info(`Updated soundEnabled for user: ${userId} to ${soundEnabled}`, {
      module: "queries",
    })
    return result[0]
  } catch (error) {
    logger.error(`Error updating soundEnabled for user: ${userId}`, {
      error,
      module: "queries",
    })
    throw new Error("Failed to update sound preference")
  }
}

// Update the theme for a given user
export async function updateUserTheme(
  userId: string,
  theme: (typeof themeEnum.enumValues)[number]
) {
  await initializeDb()
  if (!themeEnum.enumValues.includes(theme)) {
    logger.error("Invalid theme value: %s", { theme })
    throw new Error("Invalid theme value")
  }

  try {
    const result = await db.instance
      .update(users)
      .set({ theme, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({ updatedTheme: users.theme })

    if (!result.length) {
      logger.warn("No user found with ID: %s for theme update", { userId })
      throw new Error("User not found")
    }

    logger.info(`Updated theme for user: ${userId} to ${theme}`, {
      module: "queries",
    })
    return result[0]
  } catch (error) {
    logger.error(`Error updating theme for user: ${userId}`, {
      error,
      module: "queries",
    })
    throw new Error("Failed to update theme")
  }
}

// Update the brand color for a given user
export async function updateUserColor(
  userId: string,
  brandColor: (typeof brandColorEnum.enumValues)[number]
) {
  await initializeDb()
  if (!brandColorEnum.enumValues.includes(brandColor)) {
    logger.error("Invalid brand color value: %s", { brandColor })
    throw new Error("Invalid brand color value")
  }

  try {
    const result = await db.instance
      .update(users)
      .set({ brandColor, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({ updatedBrandColor: users.brandColor })

    if (!result.length) {
      logger.warn("No user found with ID: %s for brand color update", {
        userId,
      })
      throw new Error("User not found")
    }

    logger.info(`Updated brand color for user: ${userId} to ${brandColor}`, {
      module: "queries",
    })
    return result[0]
  } catch (error) {
    logger.error(`Error updating brand color for user: ${userId}`, {
      error,
      module: "queries",
    })
    throw new Error("Failed to update brand color")
  }
}

// Fetch all courses
export const getCourses = cache(async () => {
  await initializeDb()
  logger.info("Fetching all courses")
  try {
    const allCourses = await db.instance.query.courses.findMany({})
    logger.info("All courses fetched", { count: allCourses.length })
    return allCourses
  } catch (error) {
    logger.error("Error fetching all courses", { error })
    throw error
  }
})

// Fetch a course by ID with related units and drills
export const getCourseById = cache(async (courseId: number) => {
  await initializeDb()
  logger.info("Fetching course by ID", { courseId })
  try {
    const data = await db.instance.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: {
        units: {
          orderBy: (units, { asc }) => [asc(units.order)],
          with: {
            drills: {
              orderBy: (drills, { asc }) => [asc(drills.order)],
            },
          },
        },
      },
    })
    if (!data) {
      logger.warn("Course not found", { courseId })
      return null
    }
    logger.info("Course fetched", { courseId, data })
    return data
  } catch (error) {
    logger.error("Error fetching course by ID", { courseId, error })
    throw error
  }
})

// Fetch all units with related drills and user drill completion, excluding notes
export const getUnits = cache(async () => {
  await initializeDb()
  const session = await auth()
  const stats = await getStats()

  if (!session?.user?.id || !stats?.activeCourseId) {
    logger.warn("No user or active course for units query", {
      userId: session?.user?.id,
      activeCourseId: stats?.activeCourseId,
    })
    return []
  }

  logger.info("Fetching units for course", {
    activeCourseId: stats.activeCourseId,
    userId: session.user.id,
  })
  try {
    const data = await db.instance
      .select({
        id: units.id,
        title: units.title,
        description: units.description,
        courseId: units.courseId,
        unitNumber: units.unitNumber,
        order: units.order,
        createdAt: units.createdAt,
        updatedAt: units.updatedAt,
        notes: units.notes,
        drills: {
          id: drills.id,
          title: drills.title,
          unitId: drills.unitId,
          order: drills.order,
          drillNumber: drills.drillNumber,
          isTimed: drills.isTimed,
          createdAt: drills.createdAt,
          updatedAt: drills.updatedAt,
        },
        currentDrillId: userDrillCompletion.currentDrillId,
        questionsCompleted: userDrillCompletion.questionsCompleted,
      })
      .from(units)
      .leftJoin(drills, eq(units.id, drills.unitId))
      .leftJoin(
        userDrillCompletion,
        and(
          eq(userDrillCompletion.userId, session.user.id),
          eq(userDrillCompletion.courseId, stats.activeCourseId)
        )
      )
      .where(eq(units.courseId, stats.activeCourseId))
      .orderBy(units.order)

    if (!data.length) {
      logger.warn("No units found for course", {
        activeCourseId: stats.activeCourseId,
      })
      return []
    }

    // Group results by unit to handle multiple drills
    const groupedData = data.reduce(
      (acc, row) => {
        const unitId = row.id
        if (!acc[unitId]) {
          acc[unitId] = {
            id: row.id,
            title: row.title,
            description: row.description,
            courseId: row.courseId,
            unitNumber: row.unitNumber,
            order: row.order,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            notes: row.notes,
            drills: [],
            currentDrillId: row.currentDrillId,
            questionsCompleted: row.questionsCompleted,
          }
        }
        if (row.drills) {
          acc[unitId].drills.push(row.drills)
        }
        return acc
      },
      {} as Record<number, UnitWithDrills>
    )

    const result = Object.values(groupedData).sort((a, b) => a.order - b.order)

    logger.info("Units fetched for course", {
      activeCourseId: stats.activeCourseId,
      count: result.length,
    })
    return result
  } catch (error) {
    logger.error("Error fetching units for course", {
      activeCourseId: stats.activeCourseId,
      error,
    })
    throw error
  }
})

export const getNotes = cache(async (unitId: number) => {
  await initializeDb()
  const data = await db.instance.query.units.findFirst({
    where: eq(units.id, unitId),
    columns: {
      notes: true,
    },
  })
  return data?.notes || null
})

export const getStats = cache(async () => {
  await initializeDb()
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }
  logger.info("Fetching user stats", { userId: session.user.id })
  try {
    const data = await db.instance.query.stats.findFirst({
      where: eq(stats.userId, session.user.id),
      with: {
        activeCourse: true,
      },
    })
    if (!data) {
      logger.warn("User stats not found", { userId: session.user.id })
      return null
    }
    logger.info("User stats fetched", {
      userId: session.user.id,
      stats: data,
    })
    return {
      ...data,
      currentStreak: data.currentStreak || 0,
      longestStreak: data.longestStreak || 0,
    }
  } catch (error) {
    logger.error("Error fetching user stats", {
      userId: session.user.id,
      error,
    })
    throw error
  }
})

// Fetch random questions for a drill based on drill type and completion status
export const getDrillQuestions = cache(
  async (
    drillId: number,
    isTimed: boolean,
    isCurrentDrill: boolean,
    questionsCompleted: number | null,
    questionsPerDrill: number
  ) => {
    await initializeDb()
    logger.info("Fetching questions for drill", {
      drillId,
      isTimed,
      isCurrentDrill,
      questionsCompleted,
    })
    try {
      // Determine number of questions to fetch
      const limit =
        isTimed || !isCurrentDrill
          ? questionsPerDrill
          : Math.max(0, questionsPerDrill - (questionsCompleted || 0))

      if (limit === 0) {
        logger.info("No questions to fetch for drill", { drillId, limit })
        return []
      }

      // Fetch random questions for the drill
      const data = await db.instance
        .select({
          id: questions.id,
          text: questions.text,
          option1: questions.option1,
          option2: questions.option2,
          option3: questions.option3,
          option4: questions.option4,
          correctOption: questions.correctOption,
          explanation: questions.explanation,
        })
        .from(questions)
        .where(eq(questions.drillId, drillId))
        .orderBy(sql`RANDOM()`)
        .limit(limit)

      logger.info("Questions fetched for drill", {
        drillId,
        count: data.length,
      })
      return data
    } catch (error) {
      logger.error("Error fetching questions for drill", { drillId, error })
      throw error
    }
  }
)

export const getTopTenUsers = cache(async () => {
  await initializeDb()
  const session = await auth()
  if (!session?.user?.id) return []
  const data = await db.instance
    .select({
      userId: stats.userId,
      points: stats.points,
      name: users.name,
      image: users.image,
    })
    .from(stats)
    .innerJoin(users, eq(stats.userId, users.id))
    .orderBy(desc(stats.points))
    .limit(10)

  return data
})

export async function getLeaderboard(topN: number = 10) {
  await initializeDb()
  logger.info("Fetching leaderboard", { topN })
  try {
    const leaderboard = await db.instance
      .select({
        userId: stats.userId,
        points: stats.points,
        name: users.name,
        image: users.image,
      })
      .from(stats)
      .innerJoin(users, eq(stats.userId, users.id))
      .orderBy(desc(stats.points))
      .limit(topN)

    if (!leaderboard || leaderboard.length === 0) {
      logger.warn("No leaderboard data found")
      return []
    }
    logger.info("Leaderboard fetched", { count: leaderboard.length })
    return leaderboard
  } catch (error) {
    logger.error("Error fetching leaderboard", { error })
    throw error
  }
}

// Fetch units for a specific course by courseId
export const getUnitsByCourseId = cache(
  async (courseId: number, includeNotes: boolean = false) => {
    await initializeDb()
    logger.info("Fetching units for course", { courseId, includeNotes })
    try {
      const data = await db.instance
        .select({
          id: units.id,
          title: units.title,
          description: units.description,
          courseId: units.courseId,
          unitNumber: units.unitNumber,
          order: units.order,
          createdAt: units.createdAt,
          updatedAt: units.updatedAt,
          ...(includeNotes && { notes: units.notes }), // Conditionally include notes
        })
        .from(units)
        .where(eq(units.courseId, courseId))
        .orderBy(units.order)

      if (!data.length) {
        logger.warn("No units found for course", { courseId })
        return []
      }

      logger.info("Units fetched for course", { courseId, count: data.length })
      return data
    } catch (error) {
      logger.error("Error fetching units for course", { courseId, error })
      throw error
    }
  }
)
