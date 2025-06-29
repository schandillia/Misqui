"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus } from "lucide-react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { addDrill } from "@/app/actions/drills"
import { drillSchema } from "@/lib/schemas/drill"

// Define PartialUnit type to match courses.ts selective fields
type PartialUnit = {
  id: number
  title: string
  description: string
  courseId: number
  unitNumber: number
  order: number
}

interface DrillFormProps {
  selectedUnit?: PartialUnit
}

export const DrillForm = ({ selectedUnit }: DrillFormProps) => {
  const form = useForm<z.infer<typeof drillSchema>>({
    resolver: zodResolver(drillSchema),
    defaultValues: {
      title: "",
      isTimed: false,
    },
  })

  const {
    formState: { isSubmitting },
    reset,
  } = form
  const isFormDisabled = !selectedUnit || isSubmitting

  const onSubmit = async (data: z.infer<typeof drillSchema>) => {
    if (!selectedUnit) {
      toast.error("No unit selected")
      return
    }

    const result = await addDrill({
      unitId: selectedUnit.id,
      title: data.title,
      isTimed: data.isTimed,
    })

    if (result.success && result.data) {
      toast.success("Drill added successfully!")
      reset({ title: "", isTimed: false })
    } else {
      toast.error(result.error?.message || "Failed to add drill")
    }
  }

  return (
    <Card className="m-6 mt-3 dark:bg-black">
      <div className="px-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-wrap items-end gap-4">
              <FormItem className="min-w-[200px] flex-1">
                <FormLabel className="font-semibold">Unit Title</FormLabel>
                <FormControl>
                  <Input
                    value={selectedUnit?.title || "No unit selected"}
                    disabled
                  />
                </FormControl>
              </FormItem>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="min-w-[200px] flex-1">
                    <FormLabel className="font-semibold">Drill Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a title for the new drill"
                        {...field}
                        disabled={isFormDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isTimed"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="isTimed"
                        disabled={isFormDisabled}
                      />
                    </FormControl>
                    <FormLabel htmlFor="isTimed" className="font-semibold">
                      Timed
                    </FormLabel>
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
                Add Drill
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Card>
  )
}
