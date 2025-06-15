import { getStats, getCourses } from "@/db/queries"
import { CoursesList } from "@/app/(main)/courses/courses-list"

const Page = async () => {
  const coursesData = getCourses()
  const statsData = getStats()

  const [courses, stats] = await Promise.all([coursesData, statsData])

  const activeCourseId = stats?.activeCourseId || null

  return (
    <div className="mx-auto h-full max-w-[912px] px-3">
      <h1 className="text-2xl font-bold text-neutral-700 dark:text-neutral-400">
        Courses
      </h1>
      <div className="mt-4">
        {courses.length === 0 ? (
          <p className="text-neutral-500">No courses available.</p>
        ) : (
          <CoursesList courses={courses} activeCourseId={activeCourseId} />
        )}
        {!activeCourseId && courses.length > 0 && (
          <p className="mt-4 text-neutral-500">No course has been selected.</p>
        )}
      </div>
    </div>
  )
}

export default Page
