"use client"

import { useEffect } from "react"
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalClose,
  ResponsiveModalDescription,
} from "@/components/ui/responsive-modal"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm, ControllerRenderProps } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { courseSchema } from "@/lib/schemas/course"
import { createCourse, updateCourse } from "@/app/actions/courses"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

type Course = {
  id: number
  title: string
  description: string
  image: string
  createdAt: Date
  updatedAt: Date
}

type CourseFormValues = z.infer<typeof courseSchema>

type CourseModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course | null
  mode: "create" | "edit"
  onCourseUpdated: (updatedCourse: Course) => void
  onCourseCreated: (newCourse: Course) => void
}

export function CourseModal({
  open,
  onOpenChange,
  course,
  mode,
  onCourseUpdated,
  onCourseCreated,
}: CourseModalProps) {
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
    },
  })

  const { isSubmitting, isValid } = form.formState

  // Sync form values with course prop when modal opens or course changes
  useEffect(() => {
    if (mode === "edit" && course && open) {
      form.reset({
        title: course.title,
        description: course.description,
        image: course.image,
      })
    } else if (mode === "create" && open) {
      form.reset({
        title: "",
        description: "",
        image: "",
      })
    }
  }, [course, open, mode, form])

  const handleSubmit = async (values: CourseFormValues) => {
    try {
      const formData = new FormData()
      formData.append("title", values.title)
      formData.append("description", values.description)
      formData.append("image", values.image)

      if (mode === "edit" && course) {
        const result = await updateCourse(course.id, formData)
        if (result.success && result.data) {
          toast.success("Course updated successfully!")
          onCourseUpdated(result.data)
          onOpenChange(false)
        } else if (result.error) {
          toast.error(result.error.message)
        }
      } else if (mode === "create") {
        const result = await createCourse(formData)
        if (result.success && result.data) {
          toast.success("Course created successfully!")
          onCourseCreated(result.data)
          onOpenChange(false)
        } else if (result.error) {
          toast.error(result.error.message)
        }
      }
    } catch (_error) {
      toast.error(`Failed to ${mode === "edit" ? "update" : "create"} course`)
    }
  }

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent side="bottom">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle
            className={cn("text-center text-2xl font-bold")}
          >
            {mode === "edit" ? "Edit Course" : "Create Course"}
          </ResponsiveModalTitle>
          <ResponsiveModalDescription
            className={cn(
              "text-center text-base text-muted-foreground leading-tight mb-4"
            )}
          >
            {mode === "edit"
              ? "Edit course details here"
              : "Enter new course details here"}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({
                field,
              }: {
                field: ControllerRenderProps<CourseFormValues, "title">
              }) => (
                <FormItem>
                  <FormLabel>Course Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter course title"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({
                field,
              }: {
                field: ControllerRenderProps<CourseFormValues, "description">
              }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Enter course description"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({
                field,
              }: {
                field: ControllerRenderProps<CourseFormValues, "image">
              }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="Enter image URL"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-y-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                size="lg"
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting
                  ? mode === "edit"
                    ? "Updating..."
                    : "Creating..."
                  : mode === "edit"
                    ? "Update Course"
                    : "Create Course"}
              </Button>
              <ResponsiveModalClose asChild>
                <Button
                  type="button"
                  variant="dangerOutline"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </ResponsiveModalClose>
            </div>
          </form>
        </Form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
