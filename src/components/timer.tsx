"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import app from "@/lib/data/app.json"

type Props = {
  isExerciseCompleted: boolean
  isTimerPaused: boolean
  onComplete?: () => void
}

export const Timer = ({
  isExerciseCompleted,
  isTimerPaused,
  onComplete,
}: Props) => {
  const totalSeconds = app.QUESTIONS_PER_DRILL * app.SECONDS_PER_QUESTION
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)

  // Countdown logic
  useEffect(() => {
    if (isExerciseCompleted || isTimerPaused) {
      return
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        const newSeconds = prev - 1
        if (newSeconds <= 0) {
          clearInterval(timer) // Clear interval when time is up
          return 0
        }
        return newSeconds
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isExerciseCompleted, isTimerPaused])

  // Trigger onComplete when time runs out
  useEffect(() => {
    if (secondsLeft <= 0 && onComplete) {
      onComplete()
    }
  }, [secondsLeft, onComplete])

  // Format time as MM:SS
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

  // Granular color transition: amber at 30%, red at 20%
  const amberThreshold = totalSeconds * 0.3
  const redThreshold = totalSeconds * 0.2
  const isAmberTime =
    secondsLeft <= amberThreshold && secondsLeft > redThreshold
  const isRedTime = secondsLeft <= redThreshold
  const textColor = isRedTime
    ? "text-red-500"
    : isAmberTime
      ? "text-amber-500"
      : "text-neutral-700 dark:text-neutral-300"

  if (isExerciseCompleted || secondsLeft <= 0) {
    return null
  }

  return (
    <div className="mt-4 flex justify-center">
      <div
        className="flex items-center gap-x-2 rounded-full bg-neutral-100 px-4 py-2 shadow-sm
          dark:bg-neutral-800"
        role="timer"
        aria-live="polite"
        aria-label={`Time remaining: ${formattedTime}`}
      >
        <Clock
          className={`size-5 ${textColor} transition-colors duration-300`}
        />
        <span
          className={`text-lg font-semibold ${textColor} transition-colors duration-300`}
        >
          {formattedTime}
        </span>
      </div>
    </div>
  )
}
