export type Unit = {
  id: number
  title: string
  description: string
  courseId: number
  unitNumber: number
  order: number
  createdAt: Date
  updatedAt: Date
  notes?: string | null
}

export type UnitWithDrills = Unit & {
  drills: {
    id: number
    title: string
    unitId: number
    order: number
    drillNumber: number
    isTimed: boolean
    createdAt: Date
    updatedAt: Date
  }[]
  currentDrillId: number | null
  questionsCompleted: number | null
}
