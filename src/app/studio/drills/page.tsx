import { getCoursesWithUnits } from "@/app/actions/courses"
import { DrillsManager } from "@/app/studio/components/drills-manager"
import type { Unit as FullUnit } from "@/db/queries/types"

// Define PartialUnit type to match courses.ts selective fields
type PartialUnit = {
  id: number
  title: string
  description: string
  courseId: number
  unitNumber: number
  order: number
}

const Page = async () => {
  const coursesResult = await getCoursesWithUnits()

  return (
    <div className="h-full w-full overflow-auto bg-muted py-6">
      <div className="mx-auto w-full max-w-5xl space-y-10">
        <DrillsManager coursesResult={coursesResult} />
      </div>
    </div>
  )
}

export default Page
