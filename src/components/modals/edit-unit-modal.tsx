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
import { unitSchema } from "@/lib/schemas/unit"
import { cn } from "@/lib/utils"
import type { Unit } from "@/db/queries/types"
import toast from "react-hot-toast"
import { addUnit, updateUnit } from "@/app/actions/units"

type UnitFormValues = z.infer<typeof unitSchema>

type EditUnitModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  unit?: Unit
  courseId?: number
  onUnitUpdated?: (updatedUnit: Unit) => void
  onUnitCreated?: (newUnit: Unit) => void
}

export function EditUnitModal({
  open,
  onOpenChange,
  unit,
  courseId,
  onUnitUpdated,
  onUnitCreated,
}: EditUnitModalProps) {
  const isEditMode = !!unit

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      title: unit?.title || "",
      description: unit?.description || "",
      notes: unit?.notes || "",
    },
  })

  const { isSubmitting, isValid } = form.formState

  // Reset form when modal opens or unit changes
  useEffect(() => {
    if (open) {
      form.reset({
        title: unit?.title || "",
        description: unit?.description || "",
        notes: unit?.notes || "",
      })
    }
  }, [open, unit, form])

  async function handleSubmit(values: UnitFormValues) {
    try {
      if (isEditMode && unit && onUnitUpdated) {
        // Ensure unit is defined in edit mode
        const result = await updateUnit({
          id: unit.id,
          courseId: unit.courseId,
          title: values.title,
          description: values.description,
          notes: values.notes || null,
        })
        if (result.success && result.data) {
          toast.success("Unit updated successfully!")
          onUnitUpdated(result.data)
          onOpenChange(false)
        } else {
          toast.error(result.error?.message || "Failed to update unit")
        }
      } else if (!isEditMode && courseId && onUnitCreated) {
        const result = await addUnit({
          courseId,
          title: values.title,
          description: values.description,
          notes: values.notes || null,
        })
        if (result.success && result.data) {
          toast.success("Unit created successfully!")
          onUnitCreated(result.data)
          onOpenChange(false)
        } else {
          toast.error(result.error?.message || "Failed to create unit")
        }
      } else {
        toast.error("Invalid modal configuration")
      }
    } catch (error) {
      toast.error(
        isEditMode ? "Failed to update unit" : "Failed to create unit"
      )
    }
  }

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent side="bottom">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle
            className={cn("text-center text-2xl font-bold")}
          >
            {isEditMode ? "Edit Unit" : "Create Unit"}
          </ResponsiveModalTitle>
          <ResponsiveModalDescription
            className={cn(
              "text-center text-base text-muted-foreground leading-tight mb-4"
            )}
          >
            {isEditMode
              ? "Update unit details here"
              : "Enter new unit details here"}
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
                field: ControllerRenderProps<UnitFormValues, "title">
              }) => (
                <FormItem>
                  <FormLabel>Unit Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter unit title"
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
                field: ControllerRenderProps<UnitFormValues, "description">
              }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter unit description"
                      disabled={isSubmitting}
                      className="resize-none overflow-y-auto h-[4rem]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({
                field,
              }: {
                field: ControllerRenderProps<UnitFormValues, "notes">
              }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter unit notes (optional)"
                      disabled={isSubmitting}
                      className="resize-none overflow-y-auto h-[6rem]"
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
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                    ? "Update Unit"
                    : "Create Unit"}
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
