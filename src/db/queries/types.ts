// src/queries/types.ts
export type UnitWithDrills = {
  id: number
  title: string
  description: string | null
  subjectId: number
  unitNumber: number
  order: number
  createdAt: Date
  updatedAt: Date | null
  drills: {
    id: number
    title: string
    unitId: number
    order: number
    drill_number: number
    isTimed: boolean
    createdAt: Date
    updatedAt: Date | null
  }[]
  currentDrillId: number | null
  questionsCompleted: number | null
}
