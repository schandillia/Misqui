import { create } from "zustand"
import type { Unit } from "@/db/queries/types"

type UnitState = {
  units: Unit[]
  setUnits: (units: Unit[]) => void
  addUnit: (unit: Unit) => void
  updateUnit: (updatedUnit: Unit) => void
  removeUnit: (unitId: number) => void
}

export const useUnitStore = create<UnitState>((set) => ({
  units: [],
  setUnits: (units) => set({ units }),
  addUnit: (unit) => set((state) => ({ units: [unit, ...state.units] })),
  updateUnit: (updatedUnit) =>
    set((state) => ({
      units: state.units.map((unit) =>
        unit.id === updatedUnit.id ? updatedUnit : unit
      ),
    })),
  removeUnit: (unitId) =>
    set((state) => ({
      units: state.units.filter((unit) => unit.id !== unitId),
    })),
}))
