// src/components/countdown-timer.tsx
"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react" // Import Clock icon from Lucide React
import app from "@/lib/data/app.json"

type Props = {
  isLessonCompleted: boolean // To stop the timer when the lesson is completed
}

export const CountdownTimer = ({ isLessonCompleted }: Props) => {
  const totalSeconds = app.CHALLENGES_PER_LESSON * app.SECONDS_PER_CHALLENGE
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)

  // Countdown logic
  useEffect(() => {
    if (isLessonCompleted || secondsLeft <= 0) {
      return // Stop the timer if lesson is completed or time is up
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer) // Cleanup on unmount or when stopping
  }, [isLessonCompleted, secondsLeft])

  // Format time as MM:SS
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`

  // Granular color transition: amber at 20%, red at 10%
  const amberThreshold = totalSeconds * 0.3 // 30% of total time
  const redThreshold = totalSeconds * 0.2 // 20% of total time
  const isAmberTime =
    secondsLeft <= amberThreshold && secondsLeft > redThreshold
  const isRedTime = secondsLeft <= redThreshold
  const textColor = isRedTime
    ? "text-red-500"
    : isAmberTime
    ? "text-amber-500"
    : "text-neutral-700 dark:text-neutral-300"

  if (isLessonCompleted || secondsLeft <= 0) {
    return null // Hide timer when lesson is completed or time is up
  }

  return (
    <div className="flex justify-center mt-4">
      <div
        className="flex items-center gap-x-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-full shadow-sm"
        role="timer"
        aria-live="polite"
        aria-label={`Time remaining: ${formattedTime}`}
      >
        <Clock
          className={`h-5 w-5 ${textColor} transition-colors duration-300`}
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
