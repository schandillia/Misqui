"use client"

import { useState } from "react"
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalClose,
} from "@/components/ui/responsive-modal"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ConfirmationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  onConfirm: () => void | Promise<void>
  entityType?: "course" | "unit" | "drill"
}

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  onConfirm,
  entityType = "course",
}: ConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
    } finally {
      setIsLoading(false)
    }
  }

  const description =
    entityType === "course"
      ? `Deleting “${title}” will permanently remove it and all associated units, drills, questions, and user stats.`
      : `Deleting “${title}” will permanently remove it and any associated drills.`

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent side="bottom">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle
            className={cn("text-center text-2xl font-bold")}
          >
            Are you sure?
          </ResponsiveModalTitle>
          <ResponsiveModalDescription
            className={cn(
              "text-center text-base text-muted-foreground leading-tight mb-4"
            )}
          >
            {description} This action cannot be undone.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <div className="w-full space-y-6 mb-5">
          <div className="flex w-full flex-col gap-y-4">
            <ResponsiveModalClose asChild>
              <Button
                variant="primary"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                Keep {entityType === "course" ? "Course" : "Unit"}
              </Button>
            </ResponsiveModalClose>
            <Button
              variant="dangerOutline"
              className="w-full"
              size="lg"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              Remove {entityType === "course" ? "Course" : "Unit"}
            </Button>
          </div>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
