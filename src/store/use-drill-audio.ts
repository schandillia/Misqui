import { logger } from "@/lib/logger"
import { create } from "zustand"

type DrillAudioState = {
  soundEnabled: boolean
  soundPreferenceLoaded: boolean
  setSoundEnabled: (enabled: boolean) => void
  setSoundPreferenceLoaded: () => void
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

export const useDrillAudio = create<DrillAudioState>((set, get) => {
  const playAudio = (type: keyof typeof AUDIO_FILES) => {
    try {
      if (
        typeof window === "undefined" ||
        !get().soundEnabled ||
        !get().soundPreferenceLoaded
      ) {
        logger.info(
          `Skipped playing ${type} audio: soundEnabled=${get().soundEnabled}, soundPreferenceLoaded=${get().soundPreferenceLoaded}`,
          { module: "drill-audio" }
        )
        return
      }
      logger.info(`Playing ${type} audio`, { module: "drill-audio" })
      const audio = getAudio(type)
      audio.currentTime = 0
      audio.play()
    } catch (error) {
      logger.error(`Error playing ${type} audio`, {
        error,
        module: "drill-audio",
      })
    }
  }

  return {
    soundEnabled: true,
    soundPreferenceLoaded: false,
    setSoundEnabled: (enabled: boolean) => {
      logger.info(`Setting soundEnabled to ${enabled}`, {
        module: "drill-audio",
      })
      set({ soundEnabled: enabled })
    },
    setSoundPreferenceLoaded: () => {
      logger.info("Sound preference loaded", { module: "drill-audio" })
      set({ soundPreferenceLoaded: true })
    },
    playFinish: () => playAudio("finish"),
    playCorrect: () => playAudio("correct"),
    playIncorrect: () => playAudio("incorrect"),
  }
})
