import { create } from "zustand"
import type { Drill } from "@/db/queries"

type DrillState = {
  drills: Drill[]
  editingDrill: Drill | undefined
  setDrills: (drills: Drill[]) => void
  addDrill: (drill: Drill) => void
  updateDrill: (updatedDrill: Drill) => void
  removeDrill: (drillId: number) => void
  setEditingDrill: (drill: Drill | undefined) => void
}

export const useDrillStore = create<DrillState>((set) => ({
  drills: [],
  editingDrill: undefined,
  setDrills: (drills) => set({ drills }),
  addDrill: (drill) => set((state) => ({ drills: [drill, ...state.drills] })),
  updateDrill: (updatedDrill) =>
    set((state) => ({
      drills: state.drills.map((drill) =>
        drill.id === updatedDrill.id ? updatedDrill : drill
      ),
    })),
  removeDrill: (drillId) =>
    set((state) => ({
      drills: state.drills.filter((drill) => drill.id !== drillId),
    })),
  setEditingDrill: (drill) => set({ editingDrill: drill }),
}))
