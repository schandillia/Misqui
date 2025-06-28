import { create } from "zustand"
import type { Unit } from "@/db/queries/types"

type UnitState = {
  units: Unit[]
  editingUnit: Unit | undefined
  setUnits: (units: Unit[]) => void
  addUnit: (unit: Unit) => void
  updateUnit: (updatedUnit: Unit) => void
  removeUnit: (unitId: number) => void
  setEditingUnit: (unit: Unit | undefined) => void
}

export const useUnitStore = create<UnitState>((set) => ({
  units: [],
  editingUnit: undefined,
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
  setEditingUnit: (unit) => set({ editingUnit: unit }),
}))
