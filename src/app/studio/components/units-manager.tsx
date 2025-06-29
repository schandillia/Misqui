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
import { Button } from "@/components/ui/button"
import { UnitForm } from "@/app/studio/components/unit-form"
import { UnitTable } from "@/app/studio/components/unit-table"
import { useUnitStore } from "@/store/use-units"
import type { Unit } from "@/db/queries/types"
import { BulkUploadForm } from "@/app/studio/components/bulk-upload-form"
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

const UPLOAD_MODES = [
  { name: "single", icon: FaDatabase, label: "Single unit entry" },
  { name: "bulk", icon: FaFileCsv, label: "Bulk CSV upload" },
] as const

export const UnitsManager = ({
  coursesResult,
  unitsResult,
}: UnitsManagerProps) => {
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [uploadMode, setUploadMode] = useState<"single" | "bulk">("single")
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

  const activeIndex = UPLOAD_MODES.findIndex((mode) => mode.name === uploadMode)

  return (
    <>
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

        {/* Upload Mode Toggle */}
        <div
          className="border-brand-200 bg-brand-50 relative inline-flex w-max shrink-0 items-center
            gap-x-1.5 rounded-full border p-1.5 dark:border-neutral-700 dark:bg-neutral-800"
          role="group"
          aria-label="Upload mode toggle"
        >
          <div
            className="bg-brand-200 dark:bg-brand-900/80 absolute top-1.5 left-1.5 size-8 rounded-full
              transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(${activeIndex * 38}px)` }}
          />
          {UPLOAD_MODES.map(({ name, icon: Icon, label }) => (
            <Button
              key={name}
              variant="ghost"
              size="icon"
              onClick={() => setUploadMode(name)}
              className={`relative z-10 flex size-8 items-center justify-center rounded-full p-1.5
              transition-colors ${
              uploadMode === name
                  ? "text-brand-800 dark:text-brand-200"
                  : "text-brand-500 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-950/60"
              }`}
              aria-label={label}
            >
              <Icon className="size-5" strokeWidth={1.5} />
            </Button>
          ))}
        </div>
      </div>

      {uploadMode === "bulk" ? (
        <BulkUploadForm selectedCourse={selectedCourseObj} />
      ) : (
        <UnitForm selectedCourse={selectedCourseObj} />
      )}
      <Separator className="my-6" />
      <UnitTable courseId={selectedCourseObj?.id} />
    </>
  )
}
