// src/app/api/units/notes/[unitId]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getUnitNotes } from "@/db/queries/units"

export async function GET(req: NextRequest) {
  // Extract unitId from the dynamic route segment
  const segments = req.nextUrl.pathname.split("/")
  const unitIdStr = segments[segments.length - 1]
  const unitId = Number(unitIdStr)

  if (isNaN(unitId)) {
    return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 })
  }

  const notes = await getUnitNotes(unitId)
  if (notes === null) {
    return NextResponse.json({ error: "Notes not found" }, { status: 404 })
  }

  return NextResponse.json({ notes })
}
