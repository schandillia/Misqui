import { create } from "zustand"
import { toast } from "sonner"

type QuizAudioState = {
  playFinish: () => Promise<void>
  playCorrect: () => Promise<void>
  playIncorrect: () => Promise<void>
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

export const useQuizAudio = create<QuizAudioState>(() => {
  const playAudio = async (type: keyof typeof AUDIO_FILES): Promise<void> => {
    if (typeof window === "undefined") return

    const audio = getAudio(type)
    try {
      // Reset the audio to the beginning
      audio.currentTime = 0
      // Play the audio and await the Promise
      await audio.play()
    } catch (error) {
      console.error(`Error playing ${type} audio:`, error)
      toast.error("Failed to play audio feedback")
      throw error // Re-throw to allow callers to handle the error
    }
  }

  return {
    playFinish: () => playAudio("finish"),
    playCorrect: () => playAudio("correct"),
    playIncorrect: () => playAudio("incorrect"),
  }
})
