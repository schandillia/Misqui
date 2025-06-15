import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload } from "lucide-react"

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage Misqui content, users, and courses. Upload seed data to
            populate the database.
          </p>
        </div>

        {/* Grid Layout for Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Seed Data Upload Card */}
          <Card className="col-span-full md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Upload Seed Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seedFile">Seed File (JSON or CSV)</Label>
                  <Input
                    id="seedFile"
                    type="file"
                    accept=".json,.csv"
                    className="file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2
                      file:text-white hover:file:bg-primary/90"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataType">Data Type</Label>
                  <select
                    id="dataType"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm
                      focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="courses">Courses</option>
                    <option value="units">Units</option>
                    <option value="drills">Drills</option>
                    <option value="questions">Questions</option>
                    <option value="all">All Data</option>
                  </select>
                </div>
                <Button className="w-full md:w-auto" disabled>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload and Seed Database
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Placeholder for Other Admin Sections */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Manage Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View, edit, or create new courses for the Misqui platform.
              </p>
              <Button variant="defaultOutline" className="mt-4">
                Go to Courses
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Manage Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Administer user accounts, permissions, and activity logs.
              </p>
              <Button variant="defaultOutline" className="mt-4">
                Go to Users
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                System Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Review system logs and monitor platform performance.
              </p>
              <Button variant="defaultOutline" className="mt-4">
                View Logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
