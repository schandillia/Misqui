import { NextResponse } from "next/server"
import {
  getCourseProgress,
  getExercisePercentage,
  getUnits,
  getUserProgress,
  getUserSubscription,
} from "@/db/queries"

export async function GET() {
  const [
    userProgress,
    units,
    courseProgress,
    exercisePercentage,
    userSubscription,
  ] = await Promise.all([
    getUserProgress(),
    getUnits(),
    getCourseProgress(),
    getExercisePercentage(),
    getUserSubscription(),
  ])

  return NextResponse.json({
    userProgress,
    units,
    courseProgress,
    exercisePercentage,
    userSubscription,
  })
}
