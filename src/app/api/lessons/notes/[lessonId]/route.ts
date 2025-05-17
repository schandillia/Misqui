// src/app/api/lessons/notes/[lessonId]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getLessonNotes } from "@/db/queries/lessons"
import { auth } from "@/auth"

export async function GET(req: NextRequest) {
  // Check for authenticated user
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Extract lessonId from the dynamic route segment
  const segments = req.nextUrl.pathname.split("/")
  const lessonIdStr = segments[segments.length - 1]
  const lessonId = Number(lessonIdStr)

  if (isNaN(lessonId)) {
    return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 })
  }

  try {
    const notes = await getLessonNotes(lessonId)
    if (notes === null) {
      return NextResponse.json({ error: "Notes not found" }, { status: 404 })
    }

    return NextResponse.json({ notes })
  } catch (error) {
    console.error("Error fetching lesson notes:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
