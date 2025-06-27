import { z } from "zod"

export const unitSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be 500 characters or less"),
  notes: z
    .string()
    .max(3000, "Notes must be 3,000 characters or less")
    .optional(),
})
