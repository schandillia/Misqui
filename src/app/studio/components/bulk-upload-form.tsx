"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type Course = {
  id: number
  title: string
  description: string
  image: string
  badge: string
  createdAt: Date
  updatedAt: Date
}

type ActionResponse<T> = {
  success: boolean
  data?: T
  error?: {
    code: number
    message: string
    details?: string
  }
}

interface BulkUploadFormProps {
  selectedCourse?: Course
}

export const BulkUploadForm = ({ selectedCourse }: BulkUploadFormProps) => {
  return (
    <Card className="m-6 mt-3 dark:bg-black">
      <div className="p-5">
        <p className="text-muted-foreground text-sm">
          {selectedCourse?.title || "No course selected"}
        </p>
      </div>
    </Card>
  )
}
