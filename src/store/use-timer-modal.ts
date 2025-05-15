// src/store/use-timer-modal.ts
import { create } from "zustand"

type TimerModalState = {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useTimerModal = create<TimerModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
