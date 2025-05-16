import { NextResponse } from "next/server"
import {
  getCourseProgress,
  getExercisePercentage,
  getLessons,
  getUserProgress,
  getUserSubscription,
} from "@/db/queries"

export async function GET() {
  const [
    userProgress,
    lessons,
    courseProgress,
    exercisePercentage,
    userSubscription,
  ] = await Promise.all([
    getUserProgress(),
    getLessons(),
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
}
