import { z } from "zod"

export const courseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(50, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  image: z.string().url("Image must be a valid URL"),
  badge: z.string().url("Image must be a valid URL"),
})
