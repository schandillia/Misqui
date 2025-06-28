// src/lib/schemas/unit-bulk-upload.ts
import { z } from "zod"

export const unitCsvRowSchema = z.object({
  title: z
    .string()
    .min(3, "Unit title must be at least 3 characters")
    .max(100, "Unit title must be 100 characters or less")
    .nonempty("Unit title is required"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be 1,000 characters or less")
    .nonempty("Description is required"),
})

export const unitCsvFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 1024 * 1024, {
    message: "File must be less than 1MB",
  })
  .refine((file) => file.type === "text/csv", {
    message: "Only CSV files are allowed",
  })
