import { z } from "zod"

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Name must be at least 1 character long")
  .max(50, "Name must be at most 50 characters long")
  .regex(
    /^[\p{L}\s'.’.-]+$/u,
    "Name can only contain letters, spaces, apostrophes, hyphens, and periods"
  )
  .refine((val) => !/[^\p{L}\s'.’.-]/u.test(val), {
    message: "Name cannot contain numbers, emojis, or symbols",
  })
  .transform((val) =>
    val.replace(/\s+/g, " ").replace(/^[.\-'\s’]+|[.\-'\s’]+$/g, "")
  )
