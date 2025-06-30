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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DrillForm } from "@/app/studio/components/drill-form"
import { DrillTable } from "@/app/studio/components/drill-table"
import { BulkUnitsUploadForm } from "@/app/studio/components/bulk-units-upload-form"
import { useDrillStore } from "@/store/use-drills"
import { useUnitStore } from "@/store/use-units"
import { getDrillsByUnitId } from "@/app/actions/drills"
import { FaDatabase, FaFileCsv } from "react-icons/fa6"
import type { Unit } from "@/db/queries"

// Define Course type to match courses.ts
type Course = {
  id: number
  title: string
  description: string
  image: string
  badge: string
  createdAt: Date
  updatedAt: Date
  units?: Unit[]
}

// Define ActionResponse type to match courses.ts
type ActionResponse<T> = {
  success: boolean
  data?: T
  error?: {
    code: number
    message: string
    details?: string
  }
}

interface DrillsManagerProps {
  coursesResult: ActionResponse<Course[]>
}

export const DrillsManager = ({ coursesResult }: DrillsManagerProps) => {
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [selectedUnit, setSelectedUnit] = useState<string>("")
  const [units, setUnits] = useState<Unit[]>([])
  const { setUnits: setStoreUnits } = useUnitStore()
  const { setDrills } = useDrillStore()

  // Initialize units and drills stores when selectedCourse or selectedUnit changes
  useEffect(() => {
    if (coursesResult.success && coursesResult.data) {
      const selectedCourseObj = coursesResult.data.find(
        (course) => course.id.toString() === selectedCourse
      )
      const newUnits = selectedCourseObj?.units || []
      setUnits(newUnits)
      setStoreUnits(newUnits)
      if (!selectedCourse || newUnits.length === 0) {
        setSelectedUnit("")
      }
    } else {
      setUnits([])
      setStoreUnits([])
      setSelectedUnit("")
    }
  }, [coursesResult, selectedCourse, setStoreUnits])

  useEffect(() => {
    if (selectedUnit) {
      getDrillsByUnitId(Number(selectedUnit)).then((result) => {
        if (result.success && result.data) {
          setDrills(result.data)
        } else {
          setDrills([])
        }
      })
    } else {
      setDrills([])
    }
  }, [selectedUnit, setDrills])

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

  // Find the selected course and unit objects based on the ID
  const selectedCourseObj = coursesResult.data.find(
    (course) => course.id.toString() === selectedCourse
  )
  const selectedUnitObj = units.find(
    (unit) => unit.id.toString() === selectedUnit
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

        <Select
          value={selectedUnit}
          onValueChange={setSelectedUnit}
          disabled={!selectedCourse || units.length === 0}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select a unit" />
          </SelectTrigger>
          <SelectContent>
            {units.map((unit: Unit) => (
              <SelectItem key={unit.id} value={unit.id.toString()}>
                {unit.title}
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
        <DrillForm selectedUnit={selectedUnitObj} />
      </TabsContent>
      <TabsContent value="bulk">
        <BulkUnitsUploadForm selectedCourse={selectedCourseObj} />
      </TabsContent>

      <Separator className="my-6" />
      <DrillTable unitId={selectedUnitObj?.id} />
    </Tabs>
  )
}
