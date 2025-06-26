"use client"

import { useEffect } from "react"
import { useCourseStore } from "@/store/use-courses"
import toast from "react-hot-toast"
import { CoursesTable } from "@/app/studio/components/course-table"
import { CourseForm } from "@/app/studio/components/course-form"
import { logger } from "@/lib/logger"
import { Separator } from "@/components/ui/separator"

type Course = {
  id: number
  title: string
  description: string
  image: string
  badge: string
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
  const { setCourses, editingCourse } = useCourseStore()

  useEffect(() => {
    if (coursesResult.success && coursesResult.data) {
      setCourses(coursesResult.data)
    } else if (coursesResult.error) {
      toast.error(coursesResult.error.message)
      logger.error("Failed to fetch courses", { error: coursesResult.error })
    }
  }, [coursesResult, setCourses])

  useEffect(() => {
    logger.debug("editingCourse state changed", { editingCourse })
  }, [editingCourse])

  const handleFormSuccess = () => {
    // Clear editing course after successful add or update
    if (editingCourse) {
      logger.info(`Clearing editing course with ID: ${editingCourse.id}`)
    }
    useCourseStore.getState().setEditingCourse(undefined)
  }

  return (
    <>
      <CourseForm course={editingCourse} onSuccess={handleFormSuccess} />
      <Separator className="my-10" />
      <CoursesTable />
    </>
  )
}
