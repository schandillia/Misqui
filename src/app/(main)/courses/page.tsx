import { List } from "@/app/(main)/courses/list"
import { getCourses } from "@/db/queries"

const Page = async () => {
  const courses = await getCourses()
  return (
    <div className="h-full max-w-[912px] px-3 mx-auto">
      <h1 className="font-bold text-2xl text-neutral-700">Courses</h1>

      <List courses={courses} activeCourseId={1} />
    </div>
  )
}
export default Page
