import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Save } from "lucide-react"
import { createCourse, updateCourse } from "@/app/actions/courses"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { courseSchema } from "@/lib/schemas/course"
import { useCourseStore } from "@/store/use-courses"
import { logger } from "@/lib/logger"
import { useEffect, useState } from "react"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type Course = {
  id: number
  title: string
  description: string
  createdAt: Date
  updatedAt: Date
}

interface UnitFormProps {
  course?: Course
  onSuccess?: () => void
}

type UnitFormData = z.infer<typeof courseSchema>

function SubmitButton({
  isEditing,
  isLoading,
}: {
  isEditing: boolean
  isLoading: boolean
}) {
  return (
    <Button
      variant="primary"
      type="submit"
      size="lg"
      className="gap-2"
      disabled={isLoading}
    >
      {isEditing ? (
        <>
          <Save className="size-4" />
          Update Course
        </>
      ) : (
        <>
          <Plus className="size-4" />
          Add Course
        </>
      )}
    </Button>
  )
}

export const UnitForm = ({ course, onSuccess }: UnitFormProps) => {
  const { updateCourse: updateStoreCourse, addCourse } = useCourseStore()
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<UnitFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course?.title || "",
      description: course?.description || "",
    },
  })

  const { control, handleSubmit, reset } = form

  useEffect(() => {
    logger.debug("Course prop changed", { course })
    reset({
      title: course?.title || "",
      description: course?.description || "",
    })
  }, [course, reset])

  const onSubmit = async (data: UnitFormData) => {
    logger.debug("Form submitted", { data })
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("description", data.description)

      let result
      if (course && course.id) {
        logger.info(`Updating course id ${course.id}`)
        result = await updateCourse(course.id, formData)
      } else {
        logger.info("Creating new course")
        result = await createCourse(formData)
      }

      if (result.success && result.data) {
        toast.success(
          course && course.id
            ? "Course updated successfully!"
            : "Course created successfully!"
        )
        if (course && course.id) {
          updateStoreCourse(result.data)
        } else {
          addCourse(result.data)
        }
        onSuccess?.()
        reset()
      } else if (result.error) {
        logger.error("Failed to process course", { error: result.error })
        toast.error(result.error.message || "An error occurred")
      }
    } catch (error) {
      logger.error("Unexpected error during course submission", { error })
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="m-6 dark:bg-black">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 px-5">
          <div className="flex flex-col gap-6 md:flex-row">
            {/* Left column: Title, Image & Badge */}
            <div className="flex-1 space-y-10">
              {/* Title */}
              <FormField
                control={control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter unit title"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Right column: Description */}
            <div className="flex-1">
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter unit description"
                        rows={6}
                        className="resize-none h-34"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center">
            <SubmitButton
              isEditing={!!course && !!course.id}
              isLoading={isLoading}
            />
          </div>
        </form>
      </Form>
    </Card>
  )
}
