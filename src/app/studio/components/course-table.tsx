"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, Pencil } from "lucide-react"
import { useCourseStore } from "@/store/use-courses"
import { deleteCourse } from "@/app/actions/courses"
import toast from "react-hot-toast"
import { ConfirmationModal } from "@/components/modals/confirmation-modal"
import { logger } from "@/lib/logger"

type Course = {
  id: number
  title: string
  description: string
  image: string
  badge: string
  createdAt: Date
  updatedAt: Date
}

export function CoursesTable() {
  const TITLE_PREVIEW = 10
  const DESCRIPTION_PREVIEW = 30

  const { courses, removeCourse, setEditingCourse } = useCourseStore()
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)

  const handleDelete = async (courseId: number) => {
    const result = await deleteCourse(courseId)
    if (result.success) {
      toast.success("Course deleted successfully!")
      removeCourse(courseId)
      setCourseToDelete(null)
    } else if (result.error) {
      toast.error(result.error.message)
      setCourseToDelete(null)
    }
  }

  const handleEdit = (course: Course) => {
    if (!course.id) {
      logger.error("Invalid course ID for editing", { course })
      toast.error("Cannot edit course: Invalid ID")
      return
    }
    logger.debug("Setting editing course", {
      courseId: course.id,
      title: course.title,
    })
    setEditingCourse(course)
  }

  return (
    <>
      {courses.length > 0 ? (
        <div className="overflow-x-auto px-5">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-sm font-semibold">
                  ID
                </TableHead>
                <TableHead
                  className={`w-[${TITLE_PREVIEW}ch] text-left text-sm font-semibold`}
                >
                  Title
                </TableHead>
                <TableHead
                  className={`w-[${DESCRIPTION_PREVIEW}ch] text-left text-sm font-semibold`}
                >
                  Description
                </TableHead>
                <TableHead className="text-left text-sm font-semibold">
                  Image
                </TableHead>
                <TableHead className="text-left text-sm font-semibold">
                  Badge
                </TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id} className="group">
                  <TableCell className="py-2 text-sm text-muted-foreground">
                    {course.id}
                  </TableCell>
                  <TableCell className="py-2 text-sm">
                    <span
                      className={`block max-w-[${TITLE_PREVIEW}ch] truncate`}
                    >
                      {course.title}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 text-sm text-muted-foreground">
                    <span
                      className={`block max-w-[${DESCRIPTION_PREVIEW}ch] truncate`}
                    >
                      {course.description}
                    </span>
                  </TableCell>
                  <TableCell className="py-2">
                    <Image
                      src={course.image}
                      alt={`${course.title} image`}
                      width={30}
                      height={30}
                      className="rounded-sm border object-contain"
                    />
                  </TableCell>
                  <TableCell className="py-2">
                    <Image
                      src={course.badge}
                      alt={`${course.title} badge`}
                      width={30}
                      height={30}
                      className="rounded-sm border object-contain"
                    />
                  </TableCell>
                  <TableCell className="py-2 text-sm">
                    <div className="flex justify-end gap-x-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        className="hover:bg-transparent dark:hover:bg-transparent p-0"
                        size="sm"
                        onClick={() => handleEdit(course)}
                      >
                        <Pencil className="size-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="hover:bg-transparent dark:hover:bg-transparent p-0"
                        size="sm"
                        onClick={() => setCourseToDelete(course)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No courses found.</p>
      )}
      {courseToDelete && (
        <ConfirmationModal
          open={!!courseToDelete}
          onOpenChange={(open) => !open && setCourseToDelete(null)}
          title={courseToDelete.title}
          onConfirm={() => handleDelete(courseToDelete.id)}
          entityType="course"
        />
      )}
    </>
  )
}
