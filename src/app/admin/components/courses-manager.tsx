"use client"

import { useEffect } from "react"
import { CoursesList } from "./courses-list"
import { useCourseStore } from "@/store/use-courses"
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

interface CoursesManagerProps {
  coursesResult: CoursesResult
}

export function CoursesManager({ coursesResult }: CoursesManagerProps) {
  const { setCourses } = useCourseStore()

  useEffect(() => {
    if (coursesResult.success && coursesResult.data) {
      setCourses(coursesResult.data)
    } else if (coursesResult.error) {
      toast.error(coursesResult.error.message)
    }
  }, [coursesResult, setCourses])

  return (
    <>
      <CoursesList />
    </>
  )
}
