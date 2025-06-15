import { z } from "zod"

export const birthdateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD")
  .refine(
    (val) => {
      const [year, month, day] = val.split("-").map(Number)
      const date = new Date(year, month - 1, day)
      return (
        !isNaN(date.getTime()) &&
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      )
    },
    {
      message: "Invalid date",
    }
  )
  .refine(
    (val) => {
      const date = new Date(val)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date <= today
    },
    {
      message: "Birthdate cannot be in the future",
    }
  )
  .refine(
    (val) => {
      const date = new Date(val)
      const minDate = new Date("1900-01-01")
      return date >= minDate
    },
    {
      message: "Birthdate cannot be before 1900",
    }
  )
  .transform((val) => {
    const [year, month, day] = val.split("-").map(Number)
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
  })
