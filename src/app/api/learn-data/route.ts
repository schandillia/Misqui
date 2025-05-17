// @/app/api/learn-data/route.ts
import { NextResponse } from "next/server"
import {
  getCourseProgress,
  getExercisePercentage,
  getLessons,
  getUserProgress,
  getUserSubscription,
} from "@/db/queries"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userProgress = await getUserProgress()
    if (!userProgress || !userProgress.activeCourse) {
      return NextResponse.json({ error: "No active course" }, { status: 404 })
    }

    const [lessons, courseProgress, exercisePercentage, userSubscription] =
      await Promise.all([
        getLessons(userProgress.activeCourse.id), // Pass courseId
        getCourseProgress(),
        getExercisePercentage(),
        getUserSubscription(),
      ])

    return NextResponse.json({
      userProgress,
      lessons,
      courseProgress,
      exercisePercentage,
      userSubscription,
    })
  } catch (error) {
    console.error("Error in /api/learn-data:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
