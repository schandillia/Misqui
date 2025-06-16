"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, Pencil, Plus } from "lucide-react"
import { useCourseStore } from "@/store/use-courses"
import { deleteCourse } from "@/app/actions/courses"
import toast from "react-hot-toast"
import { ConfirmationModal } from "@/components/modals/confirmation-modal"
import { CourseModal } from "@/components/modals/edit-course-modal"

// Define Course type to match schema
type Course = {
  id: number
  title: string
  description: string
  image: string
  createdAt: Date
  updatedAt: Date
}

export function CoursesList() {
  const { courses, removeCourse, updateCourse, addCourse } = useCourseStore()
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

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

  const handleCourseUpdated = (updatedCourse: Course) => {
    updateCourse(updatedCourse)
    setCourseToEdit(null)
  }

  const handleCourseCreated = (newCourse: Course) => {
    addCourse(newCourse)
    setIsCreateModalOpen(false)
  }

  return (
    <>
      <Button
        type="button"
        className="w-full md:w-auto mb-4"
        onClick={() => setIsCreateModalOpen(true)}
      >
        <Plus className="mr-2 size-4" />
        Add Course
      </Button>
      {courses.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left text-sm font-semibold">
                  Title
                </TableHead>
                <TableHead className="text-left text-sm font-semibold">
                  Description
                </TableHead>
                <TableHead className="text-left text-sm font-semibold">
                  Created
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id} className="hover:bg-muted/50">
                  <TableCell className="py-2 text-sm">{course.title}</TableCell>
                  <TableCell className="py-2 text-sm text-muted-foreground">
                    {course.description}
                  </TableCell>
                  <TableCell className="py-2 text-sm text-muted-foreground">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-2 text-sm">
                    <div className="flex justify-end gap-6">
                      <Button
                        variant="ghost"
                        className="hover:bg-transparent p-0"
                        size="sm"
                        onClick={() => setCourseToEdit(course)}
                      >
                        <Pencil className="size-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="hover:bg-transparent p-0"
                        size="sm"
                        onClick={() => setCourseToDelete(course)}
                      >
                        <Trash2 className="size-4 text-red-500" />
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

      {/* Create/Edit Modal */}
      <CourseModal
        open={isCreateModalOpen || !!courseToEdit}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false)
            setCourseToEdit(null)
          }
        }}
        course={courseToEdit}
        mode={isCreateModalOpen ? "create" : "edit"}
        onCourseUpdated={handleCourseUpdated}
        onCourseCreated={handleCourseCreated}
      />

      {/* Delete Confirmation Modal */}
      {courseToDelete && (
        <ConfirmationModal
          open={!!courseToDelete}
          onOpenChange={(open) => !open && setCourseToDelete(null)}
          title={courseToDelete.title}
          onConfirm={() => handleDelete(courseToDelete.id)}
        />
      )}
    </>
  )
}
