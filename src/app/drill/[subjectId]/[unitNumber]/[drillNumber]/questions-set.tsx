// questions-set.tsx
"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import app from "@/lib/data/app.json"
import { DrillHeader } from "@/app/drill/[subjectId]/[unitNumber]/[drillNumber]/drill-header"
import Image from "next/image"
import { Option } from "@/app/drill/[subjectId]/[unitNumber]/[drillNumber]/option"
import { useQuizAudio } from "@/store/use-quiz-audio"
import { getSoundPreference } from "@/app/actions/get-user-sound-preference"
import { DrillFooter } from "@/app/drill/[subjectId]/[unitNumber]/[drillNumber]/drill-footer"

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

  useEffect(() => {
    getSoundPreference().then(({ soundEnabled }) => {
      setSoundEnabled(soundEnabled)
    })
  }, [setSoundEnabled])

  const isDrillCompleted = currentQuestionIndex >= questions.length

  useEffect(() => {
    if ((drillFinished || isDrillCompleted) && !hasPlayedFinishAudio.current) {
      hasPlayedFinishAudio.current = true
      playFinish()
    }
  }, [drillFinished, isDrillCompleted, playFinish])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (answerChecked) return
      const key = parseInt(e.key)
      if (key >= 1 && key <= 4) {
        e.preventDefault()
        setSelectedOption(key)
        optionRefs.current[key - 1]?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [answerChecked, selectedOption, currentQuestionIndex])

  const totalQuestions = app.QUESTIONS_PER_DRILL
  const progressValue =
    totalQuestions > 0 ? (questionsCompleted / totalQuestions) * 100 : 0
  const currentQuestion = questions[currentQuestionIndex]

  const handleOptionSelect = (option: number) => {
    if (answerChecked) return
    setSelectedOption(option)
  }

  const handleCheckAnswer = () => {
    if (selectedOption === null) return
    const correct = selectedOption === currentQuestion.correctOption
    setIsCorrect(correct)
    setTotalAttempts((prev) => prev + 1)
    if (correct) {
      setCorrectAnswersCount((prev) => prev + 1)
      playCorrect()
    } else {
      playIncorrect()
    }
    if (!isTimed) {
      setShowExplanation(true)
    }
    setAnswerChecked(true)
    if (isTimed) return
    if (correct) {
      setPoints((prev) => prev + app.POINTS_PER_QUESTION)
      if (!isCurrent) {
        setGemsCount((prev) => Math.min(prev + 1, app.GEMS_LIMIT))
      }
    } else {
      if (isCurrent) {
        setGemsCount((prev) => Math.max(0, prev - 1))
      }
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setQuestionsCompleted((prev) => prev + 1)
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedOption(null)
      setShowExplanation(false)
      setIsCorrect(false)
      setAnswerChecked(false)
    } else {
      setQuestionsCompleted(totalQuestions)
      setDrillFinished(true)
    }
  }

  const handleRetry = () => {
    setSelectedOption(null)
    setShowExplanation(false)
    setIsCorrect(false)
    setAnswerChecked(false)
  }

  const handleFinish = () => {
    setQuestionsCompleted(totalQuestions)
    setDrillFinished(true)
  }

  const getStatus = (): "correct" | "wrong" | "none" | "completed" => {
    if (drillFinished || isDrillCompleted) return "completed"
    if (answerChecked && isCorrect) return "correct"
    if (answerChecked && !isCorrect) return "wrong"
    return "none"
  }

  const getButtonClass = (option: number) => {
    if (!answerChecked) {
      return selectedOption === option
        ? "p-2 bg-blue-100 border-blue-500 border-2 rounded transition"
        : "p-2 bg-gray-100 rounded hover:bg-gray-200 transition"
    }
    if (isTimed) {
      return selectedOption === option
        ? "p-2 bg-blue-100 border-blue-500 border-2 rounded transition"
        : "p-2 bg-gray-100 rounded opacity-70"
    } else {
      if (isCorrect) {
        if (option === selectedOption) {
          return "p-2 bg-green-100 text-green-800 rounded border-2 border-green-500"
        }
      } else {
        if (option === selectedOption) {
          return "p-2 bg-red-100 text-red-800 rounded border-2 border-red-500"
        }
      }
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
        </div>
        <DrillFooter
          disabled={false}
          isTimed={isTimed}
          status="completed"
          onCheck={handleFinish}
        />
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
        <DrillFooter
          disabled={true}
          isTimed={isTimed}
          status="none"
          onCheck={() => {}}
        />
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
                      audio={null}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <DrillFooter
        disabled={selectedOption === null && !answerChecked}
        isTimed={isTimed}
        status={getStatus()}
        onCheck={() => {
          if (!answerChecked) handleCheckAnswer()
          else if (isTimed || isCorrect) handleNext()
          else handleRetry()
        }}
        explanation={showExplanation ? currentQuestion.explanation : null}
      />
    </>
  )
}

export default QuestionsSet
