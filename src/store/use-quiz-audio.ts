import { create } from "zustand"

type QuizAudioState = {
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  playFinish: () => void
  playCorrect: () => void
  playIncorrect: () => void
}

const AUDIO_FILES = {
  finish: "/audio/effects/finish.wav",
  correct: "/audio/effects/correct.wav",
  incorrect: "/audio/effects/incorrect.wav",
} as const

// Initialize audio elements lazily
let finishAudio: HTMLAudioElement | null = null
let correctAudio: HTMLAudioElement | null = null
let incorrectAudio: HTMLAudioElement | null = null

const getAudio = (type: keyof typeof AUDIO_FILES): HTMLAudioElement => {
  if (typeof window === "undefined") {
    throw new Error("Audio can only be used in browser environment")
  }

  switch (type) {
    case "finish":
      if (!finishAudio) finishAudio = new Audio(AUDIO_FILES.finish)
      return finishAudio
    case "correct":
      if (!correctAudio) correctAudio = new Audio(AUDIO_FILES.correct)
      return correctAudio
    case "incorrect":
      if (!incorrectAudio) incorrectAudio = new Audio(AUDIO_FILES.incorrect)
      return incorrectAudio
  }
}

export const useQuizAudio = create<QuizAudioState>((set, get) => {
  const playAudio = (type: keyof typeof AUDIO_FILES) => {
    try {
      if (typeof window === "undefined" || !get().soundEnabled) return

      const audio = getAudio(type)
      audio.currentTime = 0
      audio.play()
    } catch (error) {
      console.error(`Error playing ${type} audio:`, error)
    }
  }

  return {
    soundEnabled: true, // Default until fetched
    setSoundEnabled: (enabled: boolean) => set({ soundEnabled: enabled }),
    playFinish: () => playAudio("finish"),
    playCorrect: () => playAudio("correct"),
    playIncorrect: () => playAudio("incorrect"),
  }
})
