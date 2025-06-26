import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import brand from "@/lib/data/brand.json"
import { getCourses } from "@/app/actions/courses"
import { CoursesManager } from "@/app/admin/components/courses-manager"
import { Separator } from "@/components/ui/separator"
import { UnitsManager } from "@/app/admin/components/units-manager"
import { DrillsManager } from "@/app/admin/components/drills-manager"
import { Uploader } from "@/app/admin/components/uploader"

export default async function AdminPage() {
  const coursesResult = await getCourses()

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="mx-auto">
        {/* Header Section */}
        <div className="flex w-full flex-col items-center bg-white dark:bg-black py-2 md:py-4 lg:py-6">
          <h1
            className="mt-2 mb-1 text-center text-2xl font-bold text-neutral-700 sm:text-3xl
              dark:text-neutral-400"
          >
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mb-6 max-w-2xl text-center text-base sm:text-lg">
            Manage {brand.BRAND} content, users, and courses.
          </p>
        </div>
        <Separator className="mb-10 h-0.5 w-full rounded-full" />

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-6 lg:px-8 pb-10">
          {/* Courses Management Card */}
          <Card
            className="border-1 p-8 shadow-lg shadow-neutral-300 dark:border-2 dark:shadow-neutral-800
              dark:bg-black max-w-xl"
          >
            <CardContent className="h-full w-full p-0">
              <Uploader />
            </CardContent>
          </Card>

          {/* Courses Management Card */}
          <Card
            className="border-1 p-4 shadow-lg shadow-neutral-300 dark:border-2 dark:shadow-neutral-800
              dark:bg-black max-w-xl"
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Manage Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CoursesManager coursesResult={coursesResult} />
            </CardContent>
          </Card>

          {/* Units Management Card */}
          <Card
            className="border-1 p-4 shadow-lg shadow-neutral-300 dark:border-2 dark:shadow-neutral-800
              dark:bg-black max-w-xl"
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Manage Units
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UnitsManager coursesResult={coursesResult} />
            </CardContent>
          </Card>

          {/* Drills Management Card */}
          <Card
            className="border-1 p-4 shadow-lg shadow-neutral-300 dark:border-2 dark:shadow-neutral-800
              dark:bg-black max-w-xl"
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Manage Drills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DrillsManager coursesResult={coursesResult} />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
