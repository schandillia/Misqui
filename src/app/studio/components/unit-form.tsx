"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Plus } from "lucide-react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { unitSchema } from "@/lib/schemas/unit"
import { addUnit } from "@/app/actions/units"
import { toast } from "react-hot-toast"

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

interface UnitFormProps {
  selectedCourse?: Course
}

export const UnitForm = ({ selectedCourse }: UnitFormProps) => {
  const form = useForm<z.infer<typeof unitSchema>>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      title: "",
      description: "",
      notes: "",
    },
  })

  const { isSubmitting } = form.formState
  const isFormDisabled = !selectedCourse || isSubmitting

  const onSubmit = async (data: z.infer<typeof unitSchema>) => {
    if (!selectedCourse) {
      toast.error("No course selected")
      return
    }

    const result = await addUnit({
      courseId: selectedCourse.id,
      title: data.title,
      description: data.description,
      notes: data.notes || null,
    })

    if (result.success && result.data) {
      toast.success("Unit added successfully!")
      form.reset({
        title: "",
        description: "",
        notes: "",
      })
    } else {
      toast.error(result.error?.message || "Failed to add unit")
    }
  }

  return (
    <Card className="m-6 mt-3 dark:bg-black">
      <div className="p-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title and Description Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Section: Course Title and Unit Title */}
              <div className="space-y-6">
                <FormItem>
                  <FormLabel className="font-semibold">Course Title</FormLabel>
                  <FormControl>
                    <Input
                      value={selectedCourse?.title || "No course selected"}
                      disabled
                    />
                  </FormControl>
                </FormItem>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        Unit Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter a title for the new unit"
                          {...field}
                          disabled={isFormDisabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Section: Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a detailed description of what this unit covers…"
                        {...field}
                        className="min-h-[120px] text-base resize-none"
                        disabled={isFormDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Full-Width Notes Field */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Unit Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Lesson notes explaining core concepts…"
                      {...field}
                      className="min-h-[100px] resize-none"
                      disabled={isFormDisabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-center">
              <Button
                variant="primary"
                type="submit"
                size="lg"
                className="gap-2"
                disabled={isFormDisabled}
              >
                <Plus className="size-5" />
                Add Unit
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Card>
  )
}
