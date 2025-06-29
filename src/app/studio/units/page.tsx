import { getCourses } from "@/app/actions/courses"
import { getUnitsByCourseId } from "@/app/actions/units"
import { UnitsManager } from "@/app/studio/components/units-manager"
import type { Unit } from "@/db/queries/types"

type ActionResponse<T> = {
  success: boolean
  data?: T
  error?: {
    code: number
    message: string
  }
}

const Page = async () => {
  const coursesResult = await getCourses()

  // Fetch units for all courses if coursesResult is successful
  let unitsResult: ActionResponse<Unit[]> = { success: true, data: [] }
  if (coursesResult.success && coursesResult.data) {
    try {
      const unitsPromises = coursesResult.data.map((course) =>
        getUnitsByCourseId(course.id)
      )
      const unitsResults = await Promise.all(unitsPromises)

      // Combine all units, handling potential errors
      const allUnits: Unit[] = unitsResults
        .filter((result) => result.success && result.data)
        .flatMap((result) => result.data!)

      unitsResult = { success: true, data: allUnits }
    } catch (_error) {
      unitsResult = {
        success: false,
        error: { code: 500, message: "Failed to fetch units" },
      }
    }
  }

  return (
    <div className="h-full w-full overflow-auto bg-muted py-6">
      <div className="mx-auto w-full max-w-5xl space-y-10">
        <UnitsManager coursesResult={coursesResult} unitsResult={unitsResult} />
      </div>
    </div>
  )
}

export default Page
