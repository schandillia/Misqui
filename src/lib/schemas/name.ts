import { z } from "zod"

export const nameSchema = z.preprocess(
  (val) => {
    if (typeof val !== "string") return val
    return val
      .trim()
      .replace(/\s+/g, " ")
      .replace(/^[.\-'\s’]+|[.\-'\s’]+$/g, "")
  },
  z
    .string()
    .min(1, "Name must be at least 1 character long")
    .max(50, "Name must be at most 50 characters long")
    .regex(
      /^[\p{L}\s'.’.-]+$/u,
      "Name can only contain letters, spaces, apostrophes, hyphens, and periods"
    )
    .refine((val) => !/(--|\.\.|''|’’|'’|’'|['’.]{2,}|[-.]{2,})/.test(val), {
      message:
        "Name cannot contain consecutive punctuation (e.g., '..', '--', or multiple apostrophes)",
    })
)
