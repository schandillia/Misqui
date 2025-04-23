import { List } from "@/app/(main)/courses/list"
import { getCourses, getUserProgress } from "@/db/queries"

const Page = async () => {
  const coursesData = getCourses()
  const userProgressData = getUserProgress()

  const [courses, userProgress] = await Promise.all([
    coursesData,
    userProgressData,
  ])

  return (
    <div className="h-full max-w-[912px] px-3 mx-auto">
      <h1 className="font-bold text-2xl text-neutral-700">Courses</h1>

      <List courses={courses} activeCourseId={userProgress?.activeCourseId} />
    </div>
  )
}
export default Page
