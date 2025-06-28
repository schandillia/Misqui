import { z } from "zod"

export const courseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be 100 characters or less")
    .nonempty("Title is required"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be 1,000 characters or less")
    .nonempty("Description is required"),
  image: z.string().url("Must upload an SVG image"),
  badge: z.string().url("Must upload an SVG image"),
})
