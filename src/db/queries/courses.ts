import { db, initializeDb } from "@/db/drizzle"
import { courses } from "@/db/schema"
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
