import { cache } from "react"
import { db, initializeDb } from "@/db/drizzle"
import { courses } from "@/db/schema"
import { eq } from "drizzle-orm"
import { logger } from "@/lib/logger"

// Fetch all courses
export const getCourses = cache(async () => {
  await initializeDb()
  logger.info("Fetching all courses", { module: "course-queries" })
  try {
    const allCourses = await db.instance.query.courses.findMany({})
    logger.info("All courses fetched", {
      count: allCourses.length,
      module: "course-queries",
    })
    return allCourses
  } catch (error) {
    logger.error("Error fetching all courses", {
      error,
      module: "course-queries",
    })
    throw error
  }
})

// Fetch a course by ID with related units and drills
export const getCourseById = cache(async (courseId: number) => {
  await initializeDb()
  logger.info("Fetching course by ID", { courseId, module: "course-queries" })
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
      logger.warn("Course not found", { courseId, module: "course-queries" })
      return null
    }
    logger.info("Course fetched", { courseId, data, module: "course-queries" })
    return data
  } catch (error) {
    logger.error("Error fetching course by ID", {
      courseId,
      error,
      module: "course-queries",
    })
    throw error
  }
})
