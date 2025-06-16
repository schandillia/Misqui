import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import brand from "@/lib/data/brand.json"
import { getCourses } from "@/app/actions/courses"
import { CoursesManager } from "@/app/admin/components/courses-manager"

export default async function AdminPage() {
  const coursesResult = await getCourses()

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage {brand.BRAND} content, users, and courses.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Courses Management Card */}
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Manage Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CoursesManager coursesResult={coursesResult} />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
