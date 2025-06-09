"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import app from "@/lib/data/app.json"
import { DrillHeader } from "@/app/drill/[subjectId]/[unitNumber]/[drillNumber]/drill-header"
import Image from "next/image"
import { Option } from "@/app/drill/[subjectId]/[unitNumber]/[drillNumber]/option"
import { useQuizAudio } from "@/store/use-quiz-audio"
import { getSoundPreference } from "@/app/actions/get-user-sound-preference"

type Question = {
  id: number
  text: string
  option1: string
  option2: string
  option3: string
  option4: string
  correctOption: number
  explanation?: string | null
}

type QuestionsSetProps = {
  questions: Question[]
  questionsCompleted: number
  isCurrent: boolean
  isTimed: boolean
  initialGemsCount: number | null
  initialPoints: number
  isPro: boolean
  initialDrillTitle: string
  initialDrillNumber: number
}

const QuestionsSet = ({
  questions,
  questionsCompleted: initialCompleted,
  isCurrent,
  isTimed,
  initialGemsCount,
  initialPoints,
  isPro,
  initialDrillTitle,
  initialDrillNumber,
}: QuestionsSetProps) => {
  const { playCorrect, playIncorrect, playFinish, setSoundEnabled } =
    useQuizAudio()
  const hasPlayedFinishAudio = useRef(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questionsCompleted, setQuestionsCompleted] = useState(initialCompleted)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [gemsCount, setGemsCount] = useState(initialGemsCount ?? 0)
  const [points, setPoints] = useState(initialPoints)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [answerChecked, setAnswerChecked] = useState(false)
  const [drillFinished, setDrillFinished] = useState(false)
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const actionButtonRef = useRef<HTMLButtonElement>(null)

  // Fetch sound preference on mount
  useEffect(() => {
    getSoundPreference().then(({ soundEnabled }) => {
      setSoundEnabled(soundEnabled)
    })
  }, [setSoundEnabled])

  // Determine if the drill is complete
  const isDrillCompleted = currentQuestionIndex >= questions.length

  // Focus the action button when answer is checked
  useEffect(() => {
    if (answerChecked && actionButtonRef.current) {
      actionButtonRef.current.focus()
    }
  }, [answerChecked])

  // Play finish sound when drill is completed
  useEffect(() => {
    if ((drillFinished || isDrillCompleted) && !hasPlayedFinishAudio.current) {
      hasPlayedFinishAudio.current = true
      playFinish()
    }
  }, [drillFinished, isDrillCompleted, playFinish])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process keyboard input if answer hasn't been checked yet
      if (answerChecked) return

      // Check if the key pressed is a number between 1 and 4
      const key = parseInt(e.key)
      if (key >= 1 && key <= 4) {
        e.preventDefault() // Prevent default behavior (e.g., scrolling)
        setSelectedOption(key)
        // Focus the selected option for better accessibility
        optionRefs.current[key - 1]?.focus()
      } else if (e.key === "Enter" && selectedOption !== null) {
        // Allow submitting the selected answer with Enter key
        e.preventDefault()
        handleCheckAnswer()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [answerChecked, selectedOption, currentQuestionIndex])

  const totalQuestions = app.QUESTIONS_PER_DRILL
  const progressValue =
    totalQuestions > 0 ? (questionsCompleted / totalQuestions) * 100 : 0
  const currentQuestion = questions[currentQuestionIndex]

  const handleOptionSelect = (option: number) => {
    if (answerChecked) return // Don't allow changing answer after checking
    setSelectedOption(option)
  }

  const handleCheckAnswer = () => {
    if (selectedOption === null) return

    const correct = selectedOption === currentQuestion.correctOption
    setIsCorrect(correct)

    // Increment total attempts counter for every answer check
    setTotalAttempts((prev) => prev + 1)

    if (correct) {
      setCorrectAnswersCount((prev) => prev + 1)
      playCorrect() // Play sound for correct answer
    } else {
      playIncorrect() // Play sound for incorrect answer
    }

    if (!isTimed) {
      setShowExplanation(true)
    }
    setAnswerChecked(true)

    // Handle scoring logic based on isTimed and isCurrent
    if (isTimed) {
      // No change in gems or points for timed drills
      return
    }

    if (correct) {
      // Award points for correct answers in non-timed drills
      setPoints((prev) => prev + app.POINTS_PER_QUESTION)
      // Only increment gems if not current (i.e., practice mode)
      if (!isCurrent) {
        setGemsCount((prev) => Math.min(prev + 1, app.GEMS_LIMIT))
      }
    } else {
      // Only deduct gems for incorrect answers in current (non-timed) drills
      if (isCurrent) {
        setGemsCount((prev) => Math.max(0, prev - 1))
      }
      // No points deducted for incorrect answers
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setQuestionsCompleted((prev) => prev + 1) // Update progress first
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedOption(null)
      setShowExplanation(false)
      setIsCorrect(false)
      setAnswerChecked(false)
    } else {
      // Handle drill completion
      setQuestionsCompleted(totalQuestions) // Ensure progress bar is full
      setDrillFinished(true)
    }
  }

  const handleRetry = () => {
    setSelectedOption(null)
    setShowExplanation(false)
    setIsCorrect(false)
    setAnswerChecked(false) // Allow re-selecting and checking
  }

  const handleFinish = () => {
    setQuestionsCompleted(totalQuestions) // Ensure progress bar is full
    setDrillFinished(true)
    // Optional: Call an action to save the drill attempt if needed
    // logger.info(`Drill finished. Score: ${correctAnswersCount}/${totalQuestions}`);
  }

  const getButtonClass = (option: number) => {
    if (!answerChecked) {
      // Before answer is checked
      return selectedOption === option
        ? "p-2 bg-blue-100 border-blue-500 border-2 rounded transition"
        : "p-2 bg-gray-100 rounded hover:bg-gray-200 transition"
    }
    // After answer is checked
    if (isTimed) {
      // For timed drills: highlight selected, others neutral, no correct/incorrect indication
      return selectedOption === option
        ? "p-2 bg-blue-100 border-blue-500 border-2 rounded transition" // Keep selected highlighted
        : "p-2 bg-gray-100 rounded opacity-70" // Other options appear inactive
    } else {
      // For non-timed drills
      if (isCorrect) {
        // Answer was correct
        if (option === selectedOption) {
          // This is also the correctOption
          return "p-2 bg-green-100 text-green-800 rounded border-2 border-green-500" // Highlight correct answer green
        }
      } else {
        // Answer was incorrect
        if (option === selectedOption) {
          return "p-2 bg-red-100 text-red-800 rounded border-2 border-red-500" // Highlight user's incorrect choice red
        }
        // For incorrect answers, do not highlight the correct option. All other options are neutral.
      }
      // Default for other options (unselected if correct, or non-selected and non-correct if incorrect)
      return "p-2 bg-gray-100 rounded opacity-70"
    }
  }

  if (drillFinished || isDrillCompleted) {
    return (
      <div className="flex min-h-screen flex-col">
        <div
          className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-y-4
            text-center lg:gap-y-8"
        >
          <h2 className="text-xl font-bold text-neutral-700 lg:text-3xl dark:text-neutral-300">
            Drill Finished!
          </h2>
          <p className="text-lg text-neutral-600 lg:text-xl dark:text-neutral-400">
            You answered{" "}
            <span className="font-semibold text-blue-600">
              {correctAnswersCount}
            </span>{" "}
            out of{" "}
            <span className="font-semibold text-blue-600">{totalAttempts}</span>{" "}
            attempts correctly.
          </p>
          <Link href="/learn">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition">
              Back to Learn
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <div
          className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-y-4
            text-center lg:gap-y-8"
        >
          <p className="text-lg text-neutral-600 lg:text-xl dark:text-neutral-400">
            No questions available for this drill.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DrillHeader
        gems={gemsCount}
        percentage={progressValue}
        hasActiveSubscription={isPro}
        drillTitle={initialDrillTitle}
        drillNumber={initialDrillNumber}
        isTimed={isTimed}
        isDrillCompleted={isDrillCompleted}
        // isTimerPaused={isTimerPaused}
      />
      <div className="flex-1">
        <div className="flex h-full items-center justify-center">
          <div className="flex w-full flex-col gap-y-12 px-6 lg:min-h-[350px] lg:w-[600px] lg:px-0">
            <div className="my-6 flex items-center gap-x-4">
              <Image
                src="/images/mascots/mascot.svg"
                alt="Mascot"
                height={60}
                width={60}
                className="hidden lg:block"
              />
              <Image
                src="/images/mascots/mascot.svg"
                alt="Mascot"
                height={40}
                width={40}
                className="block lg:hidden"
              />
              <div className="relative rounded-xl border-2 px-4 py-2 text-sm lg:text-base">
                {currentQuestion.text}
                <div
                  className="absolute top-1/2 -left-3 size-0 -translate-y-1/2 rotate-90 transform border-x-8
                    border-t-8 border-x-transparent"
                />
              </div>
            </div>
            <div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                {[1, 2, 3, 4].map((optionNum) => {
                  const optionText = currentQuestion[
                    `option${optionNum}` as keyof Question
                  ] as string
                  return (
                    <Option
                      key={optionNum}
                      id={optionNum}
                      text={optionText}
                      shortcut={optionNum.toString()}
                      selected={selectedOption === optionNum}
                      status={
                        answerChecked
                          ? isCorrect && selectedOption === optionNum
                            ? "correct"
                            : selectedOption === optionNum
                              ? "wrong"
                              : "none"
                          : "none"
                      }
                      disabled={answerChecked}
                      onSelect={() => handleOptionSelect(optionNum)}
                      audio={null} // Set to a string URL if audio is available for options
                    />
                  )
                })}
              </div>

              {showExplanation && (
                <div
                  className={`text-sm mt-2 p-2 rounded
                  ${isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                >
                  <span className="font-semibold">
                    {isCorrect ? "Correct!" : "Incorrect"}
                  </span>
                </div>
              )}

              {showExplanation && currentQuestion.explanation && (
                <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                  <span className="font-semibold">Explanation:</span>{" "}
                  {currentQuestion.explanation}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              {(() => {
                const isLastQuestion =
                  currentQuestionIndex === questions.length - 1
                let buttonText = "Check"
                let buttonOnClick = handleCheckAnswer
                let buttonDisabled = selectedOption === null
                let buttonClassName =
                  "bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"

                if (answerChecked) {
                  buttonDisabled = false // Button is active after checking
                  buttonClassName = `text-white ${isCorrect ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`

                  if (isLastQuestion) {
                    if (isTimed) {
                      buttonText = "Finish"
                      buttonOnClick = handleFinish
                    } else {
                      // Not timed, last question
                      if (isCorrect) {
                        buttonText = "Finish"
                        buttonOnClick = handleFinish
                      } else {
                        // Not timed, last question, incorrect
                        buttonText = "Retry"
                        buttonOnClick = handleRetry
                      }
                    }
                  } else {
                    // Not the last question
                    if (isTimed || isCorrect) {
                      buttonText = "Next"
                      buttonOnClick = handleNext
                    } else {
                      // Not timed, not last question, incorrect
                      buttonText = "Retry"
                      buttonOnClick = handleRetry
                    }
                  }
                }

                return (
                  <button
                    ref={actionButtonRef}
                    onClick={buttonOnClick}
                    onKeyDown={(e) => {
                      // Allow activating the button with Enter or Space
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        buttonOnClick()
                      }
                    }}
                    disabled={buttonDisabled}
                    className={`px-4 py-2 rounded-md transition ${buttonClassName}`}
                    tabIndex={0}
                    aria-label={buttonText}
                  >
                    {buttonText}
                  </button>
                )
              })()}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default QuestionsSet
