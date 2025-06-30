"use client"

import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UnitForm } from "@/app/studio/components/unit-form"
import { UnitTable } from "@/app/studio/components/unit-table"
import { useUnitStore } from "@/store/use-units"
import type { Unit } from "@/db/queries/types"
import { BulkUnitsUploadForm } from "@/app/studio/components/bulk-units-upload-form"
import { FaDatabase, FaFileCsv } from "react-icons/fa6"

// Define Course type to match courses.ts
type Course = {
  id: number
  title: string
  description: string
  image: string
  badge: string
  createdAt: Date
  updatedAt: Date
}

// Define ActionResponse type to match courses.ts
type ActionResponse<T> = {
  success: boolean
  data?: T
  error?: {
    code: number
    message: string
  }
}

interface UnitsManagerProps {
  coursesResult: ActionResponse<Course[]>
  unitsResult: ActionResponse<Unit[]>
}

export const UnitsManager = ({
  coursesResult,
  unitsResult,
}: UnitsManagerProps) => {
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const { setUnits } = useUnitStore()

  // Initialize units store with server-fetched units
  useEffect(() => {
    if (unitsResult.success && unitsResult.data) {
      setUnits(unitsResult.data)
    }
  }, [unitsResult, setUnits])

  if (!coursesResult.success && coursesResult.error) {
    return (
      <div className="p-6 text-destructive">
        Error loading courses: {coursesResult.error.message}
      </div>
    )
  }

  if (!coursesResult.data || !coursesResult.data.length) {
    return <div className="p-6">No courses available.</div>
  }

  // Find the selected course object based on the ID
  const selectedCourseObj = coursesResult.data.find(
    (course) => course.id.toString() === selectedCourse
  )

  return (
    <Tabs defaultValue="single">
      <div className="flex items-center gap-x-4 ml-6 mt-6">
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {coursesResult.data.map((course: Course) => (
              <SelectItem key={course.id} value={course.id.toString()}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Shadcn Tabs for Upload Mode */}
        <TabsList className="grid w-max grid-cols-2">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <FaDatabase className="size-4" />
            Single insert
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <FaFileCsv className="size-4" />
            Batch insert
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="single">
        <UnitForm selectedCourse={selectedCourseObj} />
      </TabsContent>
      <TabsContent value="bulk">
        <BulkUnitsUploadForm selectedCourse={selectedCourseObj} />
      </TabsContent>

      <Separator className="my-6" />
      <UnitTable courseId={selectedCourseObj?.id} />
    </Tabs>
  )
}
