import { z } from "zod"

export const courseSchema = z.object({
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
  image: z.string().url("Must upload an SVG image"),
  badge: z.string().url("Must upload an SVG image"),
})
