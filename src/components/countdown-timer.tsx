// src/components/countdown-timer.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Clock } from "lucide-react"
import app from "@/lib/data/app.json"
import { useTimerModal } from "@/store/use-timer-modal"
import { Modal } from "@/components/ui/modal"

type Props = {
  isLessonCompleted: boolean // To stop the timer when the lesson is completed
}

export const CountdownTimer = ({ isLessonCompleted }: Props) => {
  const totalSeconds = app.CHALLENGES_PER_LESSON * app.SECONDS_PER_CHALLENGE
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const { isOpen, open, close } = useTimerModal()

  // Audio reference for the alarm
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio on component mount
  useEffect(() => {
    alarmAudioRef.current = new Audio("/audio/effects/alarm.wav")
    alarmAudioRef.current.loop = true // Set to loop

    return () => {
      // Cleanup audio on unmount
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause()
        alarmAudioRef.current = null
      }
    }
  }, [])

  // Countdown logic
  useEffect(() => {
    if (isLessonCompleted || secondsLeft <= 0) {
      if (secondsLeft <= 0 && !isLessonCompleted && !isOpen) {
        open() // Open modal when timer reaches 0
        if (alarmAudioRef.current) {
          alarmAudioRef.current.play().catch((error) => {
            console.error("Failed to play alarm:", error)
          })
        }
      }
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
  }, [isLessonCompleted, secondsLeft, isOpen, open])

  // Stop audio when modal closes
  useEffect(() => {
    if (!isOpen && alarmAudioRef.current) {
      alarmAudioRef.current.pause()
      alarmAudioRef.current.currentTime = 0 // Reset audio to start
    }
  }, [isOpen])

  // Format time as MM:SS
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`

  // Granular color transition: amber at 30%, red at 20%
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
    return (
      <>
        {/* Render the modal when time is up */}
        <Modal
          showModal={isOpen}
          setShowModal={close}
          title="Time's Up!"
          description="The timer has run out. Please return to the learn page to continue."
        >
          <div className="mt-4 flex justify-center">
            <button
              onClick={close}
              className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 transition-colors"
            >
              Close
            </button>
          </div>
        </Modal>
      </>
    )
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
