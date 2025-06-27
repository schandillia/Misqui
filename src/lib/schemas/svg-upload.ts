import { z } from "zod"

const MAX_SVG_SIZE = 50 // Maximum file size for SVG uploads in KB

export const svgUploadSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_SVG_SIZE * 1024, {
    message: `File must be less than ${MAX_SVG_SIZE}KB`,
  })
  .refine((file) => file.type === "image/svg+xml", {
    message: "Only SVG files are allowed",
  })
