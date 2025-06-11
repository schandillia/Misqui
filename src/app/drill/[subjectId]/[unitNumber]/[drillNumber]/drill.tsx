"use client"

import { useState, useEffect, useRef } from "react"
import app from "@/lib/data/app.json"
import { DrillHeader } from "@/app/drill/[subjectId]/[unitNumber]/[drillNumber]/drill-header"
import Image from "next/image"
import { Option } from "@/app/drill/[subjectId]/[unitNumber]/[drillNumber]/option"
import { useQuizAudio } from "@/store/use-quiz-audio"
import { getSoundPreference } from "@/app/actions/get-user-sound-preference"
import { DrillFooter } from "@/app/drill/[subjectId]/[unitNumber]/[drillNumber]/drill-footer"
import { updateStats } from "@/app/actions/update-stats"
import { useGemsModal } from "@/store/use-gems-modal"
import toast from "react-hot-toast"

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

type Props = {
  questions: Question[]
  questionsCompleted: number
  isCurrent: boolean
  isTimed: boolean
  initialGemsCount: number | null
  initialPoints: number
  isPro: boolean
  initialDrillTitle: string
  initialDrillNumber: number
  drillId: number
  subjectId: number
}

const Drill = ({
  questions: initialQuestions,
  questionsCompleted: initialCompleted,
  isCurrent,
  isTimed,
  initialGemsCount,
  initialPoints,
  isPro,
  initialDrillTitle,
  initialDrillNumber,
  drillId,
  subjectId,
}: Props) => {
  const { playCorrect, playIncorrect, playFinish, setSoundEnabled } =
    useQuizAudio()
  const { open: openGemsModal } = useGemsModal()
  const hasPlayedFinishAudio = useRef(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questionsCompleted, setQuestionsCompleted] = useState(initialCompleted)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [gemsCount, setGemsCount] = useState(initialGemsCount ?? 0)
  const [points, setPoints] = useState(initialPoints)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [status, setStatus] = useState<
    "correct" | "wrong" | "none" | "completed"
  >("none")
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [serverPending, setServerPending] = useState(false)
  const [questions] = useState(initialQuestions)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Log questions for debugging
  useEffect(() => {
    console.log("Drill questions:", {
      length: questions.length,
      ids: questions.map((q) => q.id),
      questions,
      currentQuestionIndex,
      questionsCompleted,
      isTimed,
      isCurrent,
    })
  }, [questions, currentQuestionIndex, questionsCompleted, isTimed, isCurrent])

  // Log initialQuestions changes for debugging
  useEffect(() => {
    console.log("initialQuestions prop changed:", {
      length: initialQuestions.length,
      ids: initialQuestions.map((q) => q.id),
    })
  }, [initialQuestions])

  useEffect(() => {
    getSoundPreference().then(({ soundEnabled }) => {
      setSoundEnabled(soundEnabled)
    })
  }, [setSoundEnabled])

  const isDrillCompleted =
    questionsCompleted >= app.QUESTIONS_PER_DRILL || status === "completed"

  useEffect(() => {
    if (isDrillCompleted && !hasPlayedFinishAudio.current) {
      console.log("Drill completed:", {
        currentQuestionIndex,
        questionsLength: questions.length,
        questionsCompleted,
        status,
      })
      hasPlayedFinishAudio.current = true
      playFinish()
      if (isTimed) {
        const scorePercentage =
          totalAttempts > 0 ? (correctAnswersCount / totalAttempts) * 100 : 0
        const pointsEarned =
          scorePercentage === 100 ? app.REWARD_POINTS_FOR_TIMED : 0
        const gemsEarned = scorePercentage === 100 ? 1 : 0
        setServerPending(true)
        updateStats({
          drillId,
          subjectId,
          isTimed,
          pointsEarned,
          gemsEarned,
          questionsCompleted: questions.length,
          isCurrent,
          scorePercentage,
          isDrillCompleted: true,
        })
          .then((response) => {
            if (response.error === "gems") {
              setPoints((prev) => prev - pointsEarned)
              setGemsCount((prev) => Math.max(0, prev - gemsEarned))
              setQuestionsCompleted((prev) => prev - questions.length)
              openGemsModal()
            }
          })
          .catch(() => {
            setPoints((prev) => prev - pointsEarned)
            setGemsCount((prev) => Math.max(0, prev - gemsEarned))
            setQuestionsCompleted((prev) => prev - questions.length)
            toast.error("Failed to save progress. Please try again.")
          })
          .finally(() => {
            setServerPending(false)
          })
      }
    }
  }, [
    isDrillCompleted,
    status,
    playFinish,
    isTimed,
    drillId,
    subjectId,
    correctAnswersCount,
    totalAttempts,
    questions,
    openGemsModal,
  ])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== "none" || serverPending) return
      const key = parseInt(e.key)
      if (key >= 1 && key <= 4) {
        e.preventDefault()
        setSelectedOption(key)
        optionRefs.current[key - 1]?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [status, serverPending])

  const totalQuestions = app.QUESTIONS_PER_DRILL
  const progressValue =
    totalQuestions > 0 ? (questionsCompleted / totalQuestions) * 100 : 0
  const currentQuestion = questions[currentQuestionIndex]

  const onSelect = (option: number) => {
    if (status !== "none" || serverPending) return
    setSelectedOption(option)
  }

  const onNext = () => {
    console.log("onNext called:", {
      currentQuestionIndex,
      questionsLength: questions.length,
      questionsCompleted,
      isTimed,
      isCorrect,
    })
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => {
        console.log("Incrementing currentQuestionIndex:", prev + 1)
        return prev + 1
      })
      if (isTimed) {
        setQuestionsCompleted((prev) => prev + 1) // Increment for all answers in timed drills
      }
      setSelectedOption(null)
      setShowExplanation(false)
      setIsCorrect(false)
      setStatus("none")
    } else {
      console.log("Setting status to completed")
      if (isTimed) {
        setQuestionsCompleted((prev) => prev + 1) // Increment for last answer
      }
      setStatus("completed")
    }
  }

  const onContinue = () => {
    if (!selectedOption && status !== "wrong") return

    console.log("onContinue called:", {
      selectedOption,
      status,
      currentQuestionIndex,
      questionsCompleted,
    })

    if (isTimed) {
      if (status === "correct" || status === "wrong") {
        onNext()
        return
      }

      const correct = selectedOption === currentQuestion.correctOption
      setIsCorrect(correct)
      setTotalAttempts((prev) => prev + 1)

      if (correct) {
        setCorrectAnswersCount((prev) => prev + 1)
        playCorrect()
        setStatus("correct")
      } else {
        playIncorrect()
        setStatus("wrong")
      }
      return
    }

    if (status === "wrong") {
      setStatus("none")
      setSelectedOption(null)
      setShowExplanation(false)
      setIsCorrect(false)
      return
    }

    if (status === "correct") {
      onNext()
      return
    }

    const correct = selectedOption === currentQuestion.correctOption
    setIsCorrect(correct)
    setTotalAttempts((prev) => prev + 1)

    if (correct) {
      setCorrectAnswersCount((prev) => prev + 1)
      playCorrect()
      setStatus("correct")
      setShowExplanation(true)
      setPoints((prev) => prev + app.POINTS_PER_QUESTION)
      setGemsCount((prev) =>
        Math.min(prev + (isCurrent ? 0 : 1), app.GEMS_LIMIT)
      )
      setQuestionsCompleted((prev) => prev + 1)

      const isLastQuestion = questionsCompleted + 1 === app.QUESTIONS_PER_DRILL
      console.log("Updating stats:", {
        isLastQuestion,
        questionsCompleted: isLastQuestion ? 0 : 1,
        drillId,
        subjectId,
      })
      setServerPending(true)
      updateStats({
        drillId,
        subjectId,
        isTimed,
        pointsEarned: app.POINTS_PER_QUESTION,
        gemsEarned: isCurrent ? 0 : 1,
        questionsCompleted: 1,
        isDrillCompleted: isLastQuestion,
      })
        .then((response) => {
          if (response.error === "gems") {
            setStatus("none")
            setSelectedOption(null)
            setShowExplanation(false)
            setIsCorrect(false)
            setCorrectAnswersCount((prev) => prev - 1)
            setTotalAttempts((prev) => prev - 1)
            setPoints((prev) => prev - app.POINTS_PER_QUESTION)
            setGemsCount((prev) => Math.max(0, prev - (isCurrent ? 0 : 1)))
            setQuestionsCompleted((prev) => prev - 1)
            openGemsModal()
          }
        })
        .catch(() => {
          setStatus("none")
          setSelectedOption(null)
          setShowExplanation(false)
          setIsCorrect(false)
          setCorrectAnswersCount((prev) => prev - 1)
          setTotalAttempts((prev) => prev - 1)
          setPoints((prev) => prev - app.POINTS_PER_QUESTION)
          setGemsCount((prev) => Math.max(0, prev - (isCurrent ? 0 : 1)))
          setQuestionsCompleted((prev) => prev - 1)
          toast.error("Failed to save progress. Please try again.")
        })
        .finally(() => {
          setServerPending(false)
        })
    } else {
      playIncorrect()
      setStatus("wrong")
      setShowExplanation(true)

      if (isCurrent && !isPro) {
        setGemsCount((prev) => Math.max(0, prev - 1))
        setServerPending(true)
        updateStats({
          drillId,
          subjectId,
          isTimed,
          gemsEarned: -1,
          questionsCompleted: 0,
        })
          .then((response) => {
            if (response.error === "gems") {
              setStatus("none")
              setSelectedOption(null)
              setShowExplanation(false)
              setGemsCount((prev) => Math.min(prev + 1, app.GEMS_LIMIT))
              openGemsModal()
            }
          })
          .catch(() => {
            setStatus("none")
            setSelectedOption(null)
            setShowExplanation(false)
            setGemsCount((prev) => Math.min(prev + 1, app.GEMS_LIMIT))
            toast.error("Failed to save progress. Please try again.")
          })
          .finally(() => {
            setServerPending(false)
          })
      }
    }
  }

  const getButtonClass = (option: number) => {
    if (status === "none") {
      return selectedOption === option
        ? "p-2 bg-blue-100 border-blue-500 border-2 rounded transition"
        : "p-2 bg-gray-100 rounded hover:bg-gray-200 transition"
    }
    if (isTimed) {
      return selectedOption === option
        ? "p-2 bg-blue-100 border-blue-500 border-2 rounded transition"
        : "p-2 bg-gray-100 rounded opacity-39"
    }
    if (isCorrect) {
      if (option === option) {
        return "p-2 bg-green-100 text-green-800 rounded border-2 border-green-500"
      }
    } else {
      if (option === selectedOption) {
        return "p-2 bg-red-100 text-red-800 rounded border-2 border-red-500"
      }
    }
    return "p-2 bg-gray-100 rounded opacity-39"
  }

  // Warn if insufficient questions
  if (questions.length < app.QUESTIONS_PER_DRILL && !isTimed && isCurrent) {
    console.warn("Insufficient questions for drill:", {
      expected: app.QUESTIONS_PER_DRILL,
      received: questions.length,
    })
  }

  if (status === "completed" || isDrillCompleted) {
    const scorePercentage =
      totalAttempts > 0 ? (correctAnswersCount / totalAttempts) * 100 : 0
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
          <p className="text-lg text-neutral-600 lg:text-xl dark:text-neutral-400">
            Your score:{" "}
            <span className="font-semibold text-blue-600">
              {scorePercentage.toFixed(0)}%
            </span>
          </p>
          {questions.length < app.QUESTIONS_PER_DRILL && (
            <p className="text-sm text-red-600">
              Note: Only {questions.length} of {app.QUESTIONS_PER_DRILL}{" "}
              questions were available.
            </p>
          )}
        </div>
        <DrillFooter
          disabled={false}
          isTimed={isTimed}
          status="completed"
          onCheck={() => window.location.reload()}
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
                        status === "correct" && selectedOption === optionNum
                          ? "correct"
                          : status === "wrong" && selectedOption === optionNum
                            ? "wrong"
                            : "none"
                      }
                      disabled={status !== "none" || serverPending}
                      onSelect={() => onSelect(optionNum)}
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
        disabled={status === "none" && (!selectedOption || serverPending)}
        isTimed={isTimed}
        status={status}
        onCheck={onContinue}
        explanation={showExplanation ? currentQuestion.explanation : null}
      />
    </>
  )
}

export default Drill
