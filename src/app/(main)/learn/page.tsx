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

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses")
  }
  if (!courseProgress) {
    redirect("/courses")
  }

  // Pass all data as initialData to the client component
  return (
    <LearnClient
      initialData={{
        userProgress: {
          ...userProgress,
          activeCourse: userProgress.activeCourse!,
        },
        lessons: lessons.map((u) => ({ notes: null, ...u })),
        courseProgress,
        exercisePercentage,
        userSubscription,
      }}
    />
  )
}
export default Page
