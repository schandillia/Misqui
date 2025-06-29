import { z } from "zod"

// Schema for unit form validation
export const unitSchema = z.object({
  title: z
    .string()
    .nonempty("Unit title is required")
    .min(3, "Unit title must be at least 3 characters")
    .max(100, "Unit title must be 100 characters or less"),
  description: z
    .string()
    .nonempty("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be 1,000 characters or less"),
  notes: z
    .string()
    .max(5000, "Notes must be 5000 characters or less")
    .optional(),
})

// Schema for individual unit in CSV
export const unitSchemaCSV = z.object({
  title: z
    .string()
    .nonempty("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be 100 characters or less"),
  description: z
    .string()
    .nonempty("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be 1,000 characters or less"),
})
