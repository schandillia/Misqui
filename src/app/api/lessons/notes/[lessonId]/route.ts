// src/app/api/lessons/notes/[lessonId]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getLessonNotes } from "@/db/queries/lessons"

export async function GET(req: NextRequest) {
  // Extract lessonId from the dynamic route segment
  const segments = req.nextUrl.pathname.split("/")
  const lessonIdStr = segments[segments.length - 1]
  const lessonId = Number(lessonIdStr)

  if (isNaN(lessonId)) {
    return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 })
  }

  const notes = await getLessonNotes(lessonId)
  if (notes === null) {
    return NextResponse.json({ error: "Notes not found" }, { status: 404 })
  }

  return NextResponse.json({ notes })
}
