// @/app/(main)/learn/page.tsx
import { LearnClient } from "@/app/(main)/learn/learn-client"
import {
  getCourseProgress,
  getExercisePercentage,
  getLessons,
  getUserProgress,
  getUserSubscription,
} from "@/db/queries"
import { redirect } from "next/navigation"

const Page = async () => {
  const userProgress = await getUserProgress()
  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses")
  }

  const [lessons, courseProgress, exercisePercentage, userSubscription] =
    await Promise.all([
      getLessons(userProgress.activeCourse.id),
      getCourseProgress(),
      getExercisePercentage(),
      getUserSubscription(),
    ])

  if (!courseProgress) {
    redirect("/courses")
  }

  return (
    <LearnClient
      initialData={{
        userProgress: {
          ...userProgress,
          activeCourse: userProgress.activeCourse!,
        },
        lessons,
        courseProgress,
        exercisePercentage,
        userSubscription,
      }}
    />
  )
}

export default Page
