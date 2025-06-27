"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UnitForm } from "@/app/studio/components/unit-form"

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
}

export const UnitsManager = ({ coursesResult }: UnitsManagerProps) => {
  const [selectedCourse, setSelectedCourse] = useState<string>("")

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
    <>
      <Select value={selectedCourse} onValueChange={setSelectedCourse}>
        <SelectTrigger className="w-40 ml-6 mt-6">
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

      <UnitForm selectedCourse={selectedCourseObj} />
    </>
  )
}
