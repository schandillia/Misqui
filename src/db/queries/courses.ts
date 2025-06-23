import { auth } from "@/auth"
import { db, initializeDb } from "@/db/drizzle"
import { courses, userCourseCompletion } from "@/db/schema"
import { logger } from "@/lib/logger"
import { eq } from "drizzle-orm"
import { cache } from "react"

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

// Fetch all course completions for a user
// export const getUserCourseCompletions = cache(async (userId: string) => {
//   await initializeDb()
//   const session = await auth()
//   if (!session?.user?.id) {
//     return null
//   }

//   logger.info("Fetching course completions for user", { userId })
//   try {
//     const completions = await db.instance.query.userCourseCompletion.findMany({
//       where: eq(userCourseCompletion.userId, userId),
//     })
//     logger.info("User course completions fetched", {
//       userId,
//       count: completions.length,
//     })
//     return completions
//   } catch (error) {
//     logger.error("Error fetching user course completions", { userId, error })
//     throw error
//   }
// })

// Fetch course completion titles and badges for a user
export const getUserCourseCompletions = cache(async (userId: string) => {
  await initializeDb()
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  logger.info("Fetching course completion titles and badges for user", {
    userId,
  })
  try {
    const completions = await db.instance
      .select({
        title: courses.title,
        badge: courses.badge,
      })
      .from(userCourseCompletion)
      .innerJoin(courses, eq(userCourseCompletion.courseId, courses.id))
      .where(eq(userCourseCompletion.userId, userId))

    const courseData = completions.map((completion) => ({
      title: completion.title,
      badge: completion.badge,
    }))
    logger.info("User course completion titles and badges fetched", {
      userId,
      count: courseData.length,
    })
    return courseData
  } catch (error) {
    logger.error("Error fetching user course completion titles and badges", {
      userId,
      error,
    })
    throw error
  }
})
