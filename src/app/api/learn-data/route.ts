import { NextResponse } from "next/server";
import {
  getCourseProgress,
  getLessonPercentage,
  getUnits,
  getUserProgress,
  getUserSubscription,
} from "@/db/queries";

export async function GET() {
  const [userProgress, units, courseProgress, lessonPercentage, userSubscription] = await Promise.all([
    getUserProgress(),
    getUnits(),
    getCourseProgress(),
    getLessonPercentage(),
    getUserSubscription(),
  ]);

  return NextResponse.json({
    userProgress,
    units,
    courseProgress,
    lessonPercentage,
    userSubscription,
  });
} 