import { create } from "zustand"

type GemsModalState = {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useGemsModal = create<GemsModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
