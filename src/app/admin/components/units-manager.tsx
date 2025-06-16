"use client"

import { useEffect } from "react"
import { UnitsList } from "./units-list"
import { useCourseStore } from "@/store/use-courses"
import { useUnitStore } from "@/store/use-units"
import toast from "react-hot-toast"

type Course = {
  id: number
  title: string
  description: string
  image: string
  createdAt: Date
  updatedAt: Date
}

type CoursesResult = {
  success: boolean
  data?: Course[]
  error?: {
    code: number
    message: string
  }
}

interface UnitsManagerProps {
  coursesResult: CoursesResult
}

export function UnitsManager({ coursesResult }: UnitsManagerProps) {
  const { setCourses } = useCourseStore()
  const { setUnits } = useUnitStore()

  useEffect(() => {
    if (coursesResult.success && coursesResult.data) {
      setCourses(coursesResult.data)
    } else if (coursesResult.error) {
      toast.error(coursesResult.error.message)
    }
  }, [coursesResult, setCourses])

  // Clear units when component mounts to ensure clean state
  useEffect(() => {
    setUnits([])
  }, [setUnits])

  return (
    <>
      <UnitsList />
    </>
  )
}
