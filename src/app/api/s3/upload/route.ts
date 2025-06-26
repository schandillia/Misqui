import { NextResponse } from "next/server"
import { uploadFile } from "@/lib/s3-client"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"

const MAX_FILE_SIZE = 50 * 1024 // 50KB

const uploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: `File size must be less than ${MAX_FILE_SIZE / 1024}KB`,
    })
    .refine((file) => file.type === "image/svg+xml", {
      message: "Only SVG files are allowed",
    }),
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    // Validate file
    const validation = uploadSchema.safeParse({ file })
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      )
    }

    const { file: validatedFile } = validation.data
    const buffer = Buffer.from(await validatedFile.arrayBuffer())
    const uniqueKey = `s/${uuidv4()}-${validatedFile.name}`
    const url = await uploadFile(buffer, uniqueKey, validatedFile.type)

    return NextResponse.json(
      { url, message: "SVG uploaded successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file to S3" },
      { status: 500 }
    )
  }
}
