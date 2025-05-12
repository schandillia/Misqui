import { LearnClient } from "@/app/(main)/learn/learn-client"
import {
  getCourseProgress,
  getLessonPercentage,
  getUnits,
  getUserProgress,
  getUserSubscription,
} from "@/db/queries"
import { redirect } from "next/navigation"

const Page = async () => {
  const [
    userProgress,
    units,
    courseProgress,
    lessonPercentage,
    userSubscription,
  ] = await Promise.all([
    getUserProgress(),
    getUnits(),
    getCourseProgress(),
    getLessonPercentage(),
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
        units: units.map((u) => ({ notes: null, ...u })),
        courseProgress,
        lessonPercentage,
        userSubscription,
      }}
    />
  )
}
export default Page
