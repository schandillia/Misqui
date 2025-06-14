import { cache } from "react"
import { db } from "@/db/drizzle"
import { auth } from "@/auth"
import { eq, and, sql, desc } from "drizzle-orm"
import {
  users,
  userSubscription,
  themeEnum,
  brandColorEnum,
  subjects,
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
  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("No authenticated user found for subscription query")
    return null
  }

  try {
    const data = await db.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, session.user.id),
    })

    if (!data) {
      logger.warn("No subscription found for user: %s", session.user.id)
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
    logger.error(
      "Error fetching subscription for user %s: %O",
      session.user.id,
      error
    )
    throw new Error("Failed to fetch user subscription")
  }
})

// Fetch the current user's sound preference
export async function getUserSoundPreference() {
  const session = await auth()
  if (!session?.user?.id) {
    logger.warn("No authenticated user found for sound preference query")
    return null
  }

  try {
    const result = await db
      .select({ soundEnabled: users.soundEnabled })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    if (!result.length) {
      logger.warn("No user found with ID: %s", session.user.id)
      return null
    }

    return result[0]
  } catch (error) {
    logger.error(
      "Error fetching sound preference for user %s: %O",
      session.user.id,
      error
    )
    throw new Error("Failed to fetch sound preference")
  }
}

// Update the sound setting for a given user
export async function updateUserSoundSetting(
  userId: string,
  soundEnabled: boolean
) {
  if (typeof soundEnabled !== "boolean") {
    logger.error("Invalid soundEnabled value: %s", soundEnabled)
    throw new Error("Sound preference must be a boolean value")
  }

  try {
    const result = await db
      .update(users)
      .set({ soundEnabled, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({ updatedSoundEnabled: users.soundEnabled })

    if (!result.length) {
      logger.warn("No user found with ID: %s for sound setting update", userId)
      throw new Error("User not found")
    }

    logger.info("Updated soundEnabled for user %s to %s", userId, soundEnabled)
    return result[0]
  } catch (error) {
    logger.error("Error updating soundEnabled for user %s: %O", userId, error)
    throw new Error("Failed to update sound preference")
  }
}

// Update the theme for a given user
export async function updateUserTheme(
  userId: string,
  theme: (typeof themeEnum.enumValues)[number]
) {
  if (!themeEnum.enumValues.includes(theme)) {
    logger.error("Invalid theme value: %s", theme)
    throw new Error("Invalid theme value")
  }

  try {
    const result = await db
      .update(users)
      .set({ theme, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({ updatedTheme: users.theme })

    if (!result.length) {
      logger.warn("No user found with ID: %s for theme update", userId)
      throw new Error("User not found")
    }

    logger.info("Updated theme for user %s to %s", userId, theme)
    return result[0]
  } catch (error) {
    logger.error("Error updating theme for user %s: %O", userId, error)
    throw new Error("Failed to update theme")
  }
}

// Update the brand color for a given user
export async function updateUserColor(
  userId: string,
  brandColor: (typeof brandColorEnum.enumValues)[number]
) {
  if (!brandColorEnum.enumValues.includes(brandColor)) {
    logger.error("Invalid brand color value: %s", brandColor)
    throw new Error("Invalid brand color value")
  }

  try {
    const result = await db
      .update(users)
      .set({ brandColor, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({ updatedBrandColor: users.brandColor })

    if (!result.length) {
      logger.warn("No user found with ID: %s for brand color update", userId)
      throw new Error("User not found")
    }

    logger.info("Updated brand color for user %s to %s", userId, brandColor)
    return result[0]
  } catch (error) {
    logger.error("Error updating brand color for user %s: %O", userId, error)
    throw new Error("Failed to update brand color")
  }
}

// Fetch all subjects
export const getSubjects = cache(async () => {
  logger.info("Fetching all subjects")
  try {
    const allSubjects = await db.query.subjects.findMany({})
    logger.info("All subjects fetched", { count: allSubjects.length })
    return allSubjects
  } catch (error) {
    logger.error("Error fetching all subjects", { error })
    throw error
  }
})

// Fetch a subject by ID with related units and drills
export const getSubjectById = cache(async (subjectId: number) => {
  logger.info("Fetching subject by ID", { subjectId })
  try {
    const data = await db.query.subjects.findFirst({
      where: eq(subjects.id, subjectId),
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
      logger.warn("Subject not found", { subjectId })
      return null
    }
    logger.info("Subject fetched", { subjectId, data })
    return data
  } catch (error) {
    logger.error("Error fetching subject by ID", { subjectId, error })
    throw error
  }
})

// Fetch all units with related drills and user drill completion, excluding notes
export const getUnits = cache(async () => {
  const session = await auth()
  const stats = await getStats()

  if (!session?.user?.id || !stats?.activeSubjectId) {
    logger.warn("No user or active subject for units query", {
      userId: session?.user?.id,
      activeSubjectId: stats?.activeSubjectId,
    })
    return []
  }

  logger.info("Fetching units for subject", {
    activeSubjectId: stats.activeSubjectId,
    userId: session.user.id,
  })
  try {
    const data = await db
      .select({
        id: units.id,
        title: units.title,
        description: units.description,
        subjectId: units.subjectId,
        unitNumber: units.unit_number,
        order: units.order,
        createdAt: units.createdAt,
        updatedAt: units.updatedAt,
        drills: {
          id: drills.id,
          title: drills.title,
          unitId: drills.unitId,
          order: drills.order,
          drill_number: drills.drill_number,
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
          eq(userDrillCompletion.subjectId, stats.activeSubjectId)
        )
      )
      .where(eq(units.subjectId, stats.activeSubjectId))
      .orderBy(units.order)

    if (!data.length) {
      logger.warn("No units found for subject", {
        activeSubjectId: stats.activeSubjectId,
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
            subjectId: row.subjectId,
            unitNumber: row.unitNumber,
            order: row.order,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
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

    logger.info("Units fetched for subject", {
      activeSubjectId: stats.activeSubjectId,
      count: result.length,
    })
    return result
  } catch (error) {
    logger.error("Error fetching units for subject", {
      activeSubjectId: stats.activeSubjectId,
      error,
    })
    throw error
  }
})

export const getNotes = cache(async (unitId: number) => {
  const data = await db.query.units.findFirst({
    where: eq(units.id, unitId),
    columns: {
      notes: true,
    },
  })
  return data?.notes || null
})

export const getStats = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }
  logger.info("Fetching user stats", { userId: session.user.id })
  try {
    const data = await db.query.stats.findFirst({
      where: eq(stats.userId, session.user.id),
      with: {
        activeSubject: true,
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
      const data = await db
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
  const session = await auth()
  if (!session?.user?.id) return []
  const data = await db
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
  logger.info("Fetching leaderboard", { topN })
  try {
    const leaderboard = await db
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
