"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { useForm, UseFormReturn } from "react-hook-form"
import { toast } from "react-hot-toast"
import { unitSchemaCSV } from "@/lib/schemas/unit"
import { bulkAddUnits } from "@/app/actions/units"

type Course = {
  id: number
  title: string
  description: string
  image: string
  badge: string
  createdAt: Date
  updatedAt: Date
}

interface BulkUploadFormProps {
  selectedCourse?: Course
}

// Schema for bulk unit data
const bulkUnitSchema = z.object({
  units: z
    .string()
    .min(1, "Please provide unit data")
    .refine(
      (data) => {
        // Split CSV into lines and validate format
        const lines = data
          .trim()
          .split("\n")
          .filter((line) => line.trim() !== "")
        if (lines.length === 0) return false

        return lines.every((line, index) => {
          const parts = line.split("|")
          if (parts.length !== 2) {
            form.setError("units", {
              type: "manual",
              message: `Line ${index + 1}: Expected 2 fields (title|description), found ${parts.length}`,
            })
            return false
          }
          const [title, description] = parts
          return title.trim() !== "" && description.trim() !== ""
        })
      },
      {
        message:
          "Each line must contain a title and description separated by '|'",
      }
    )
    .refine(
      (data) => {
        const lines = data
          .trim()
          .split("\n")
          .filter((line) => line.trim() !== "")
        const titles = lines.map((line) => line.split("|")[0].trim())
        const uniqueTitles = new Set(titles)
        if (uniqueTitles.size !== titles.length) {
          form.setError("units", {
            type: "manual",
            message: "Duplicate titles found. Each unit title must be unique.",
          })
          return false
        }
        return true
      },
      { message: "Unit titles must be unique" }
    ),
})

// Reference to form for setting errors in refine
let form: UseFormReturn<z.infer<typeof bulkUnitSchema>>

export const BulkUploadForm = ({ selectedCourse }: BulkUploadFormProps) => {
  form = useForm<z.infer<typeof bulkUnitSchema>>({
    resolver: zodResolver(bulkUnitSchema),
    defaultValues: {
      units: "",
    },
  })

  const {
    formState: { isSubmitting },
    reset,
    setError,
  } = form
  const isFormDisabled = !selectedCourse || isSubmitting

  const onSubmit = async (data: z.infer<typeof bulkUnitSchema>) => {
    try {
      // Parse CSV into array of units
      const units = data.units
        .trim()
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => {
          const [title, description] = line
            .split("|")
            .map((part) => part.trim())
          return { title, description }
        })

      // Validate each unit against unitSchemaCSV
      for (let i = 0; i < units.length; i++) {
        const result = unitSchemaCSV.safeParse(units[i])
        if (!result.success) {
          setError("units", {
            type: "manual",
            message: `Line ${i + 1}: ${result.error.errors[0].message}`,
          })
          return
        }
      }

      // Call server action to validate and insert units
      if (!selectedCourse) {
        toast.error("No course selected")
        return
      }

      const result = await bulkAddUnits({
        courseId: selectedCourse.id,
        units,
      })

      if (result.success && result.data) {
        toast.success(`Added ${result.data.length} units successfully!`)
        reset({ units: "" })
      } else {
        toast.error(result.error?.message || "Failed to add units")
      }
    } catch (_error) {
      toast.error("Invalid unit data format")
    }
  }

  return (
    <Card className="m-6 mt-3 dark:bg-black">
      <div className="p-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6">
              <FormItem>
                <FormLabel className="font-semibold">Course Title</FormLabel>
                <p className="text-sm text-muted-foreground">
                  {selectedCourse?.title || "No course selected"}
                </p>
              </FormItem>
              <FormField
                control={form.control}
                name="units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      Bulk Unit Data
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`Paste pipe-delimited data here (title|description, one per line, no header row), e.g.:
Place Value|Understand and compare multi-digit numbers using place value
Fractions|Explore fractions as parts of a whole and on a number line
Geometry|Identify shapes, angles, lines, and symmetry in two-dimensional figures`}
                        {...field}
                        className="min-h-[200px] text-base resize-none"
                        disabled={isFormDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-center">
              <Button
                variant="primary"
                type="submit"
                size="lg"
                className="gap-2"
                disabled={isFormDisabled}
              >
                <Plus className="size-5" />
                Add Units
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Card>
  )
}
