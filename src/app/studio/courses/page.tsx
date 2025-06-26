import { getCourses } from "@/app/actions/courses"
import { CoursesManager } from "@/app/studio/components/courses-manager"

const Page = async () => {
  const coursesResult = await getCourses()

  return (
    <div className="h-full w-full overflow-auto bg-muted py-6">
      <div className="mx-auto w-full max-w-5xl space-y-10">
        <CoursesManager coursesResult={coursesResult} />
      </div>
    </div>
  )
}

export default Page
