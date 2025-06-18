"use client"

import { useState, useEffect, useRef, useTransition, useMemo } from "react"
import app from "@/lib/data/app.json"
import { DrillHeader } from "@/app/drill/[courseId]/[unitNumber]/[drillNumber]/components/drill-header"
import Image from "next/image"
import { Option } from "@/app/drill/[courseId]/[unitNumber]/[drillNumber]/components/option"
import { useQuizAudio } from "@/store/use-quiz-audio"
import { getSoundPreference } from "@/app/actions/get-user-sound-preference"
import { DrillFooter } from "@/app/drill/[courseId]/[unitNumber]/[drillNumber]/components/drill-footer"
import { updateStats } from "@/app/actions/update-stats"
import { useGemsModal } from "@/store/use-gems-modal"
import toast from "react-hot-toast"
import ReactConfetti from "react-confetti"
import { useWindowSize } from "react-use"
import { useRouter } from "next/navigation"
import { getSession } from "next-auth/react"
import { ResultCard } from "@/app/drill/[courseId]/[unitNumber]/[drillNumber]/components/result-card"
import {
  getDrillResultMessage,
  getDrillTimeStatus,
} from "@/app/drill/[courseId]/[unitNumber]/[drillNumber]/utils/drill-utils"
import { logger } from "@/lib/logger"

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
  courseId: number
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
  courseId,
}: Props) => {
  const router = useRouter()
  const { playCorrect, playIncorrect, playFinish, setSoundEnabled } =
    useQuizAudio()
  const { open: openGemsModal } = useGemsModal()
  const hasPlayedFinishAudio = useRef(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const initialPointsRef = useRef(initialPoints)
  const [isUpdatePending, startUpdateTransition] = useTransition()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questionsCompleted, setQuestionsCompleted] = useState(initialCompleted)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [gemsCount, setGemsCount] = useState(initialGemsCount ?? 0)
  const [pointsEarned, setPointsEarned] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [status, setStatus] = useState<
    "correct" | "wrong" | "none" | "completed"
  >("none")
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [serverPending, setServerPending] = useState(false)
  const [questions] = useState(initialQuestions)
  const [timeTaken, setTimeTaken] = useState(0)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])

  const { width, height } = useWindowSize()
  const isDrillCompleted = status === "completed"

  // Format time as mm:ss
  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeTaken / 60)
    const seconds = timeTaken % 60
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }, [timeTaken])

  // Handle timer completion
  const handleTimerComplete = () => {
    setStatus("completed")
  }

  // Handle drill completion navigation
  const handleDrillCompleteContinue = async () => {
    if (isUpdatePending || serverPending) {
      return
    }
    // Revalidate session before navigation
    await getSession()
    router.push("/learn")
  }

  // Fetch sound preference
  useEffect(() => {
    getSoundPreference().then(({ soundEnabled }) => {
      setSoundEnabled(soundEnabled)
    })
  }, [setSoundEnabled])

  // Timer effect for elapsed time
  useEffect(() => {
    if (isDrillCompleted || serverPending) return
    const timer = setInterval(() => {
      setTimeTaken((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [isDrillCompleted, serverPending])

  // Handle drill completion stats update
  useEffect(() => {
    if (isDrillCompleted && !hasPlayedFinishAudio.current) {
      hasPlayedFinishAudio.current = true
      playFinish()

      const scorePercentage = isTimed
        ? Math.round((correctAnswersCount / app.QUESTIONS_PER_DRILL) * 100)
        : totalAttempts > 0
          ? Math.round((correctAnswersCount / totalAttempts) * 100)
          : 0

      const finalPointsEarned = isTimed
        ? scorePercentage === app.PASS_SCORE
          ? app.REWARD_POINTS_FOR_TIMED
          : 0
        : 0

      const finalGemsEarned = 0

      if (finalPointsEarned > 0) {
        setPointsEarned((prev) => prev + finalPointsEarned)
      }

      startUpdateTransition(() => {
        setServerPending(true)
        updateStats({
          drillId,
          courseId,
          isTimed,
          pointsEarned: finalPointsEarned,
          gemsEarned: finalGemsEarned,
          questionsCompleted: isTimed ? 0 : questionsCompleted,
          isDrillCompleted: true,
          isCurrent,
          scorePercentage,
        })
          .then((response) => {
            if (response.error === "gems") {
              console.error("GEMS ARE 0")
              setPointsEarned((prev) => prev - finalPointsEarned)
              setGemsCount((prev) => Math.max(0, prev - finalGemsEarned))
              setQuestionsCompleted((prev) => prev - questionsCompleted)
              openGemsModal()
            }
          })
          .catch((error) => {
            console.error("Final updateStats failed:", error)
            setPointsEarned((prev) => prev - finalPointsEarned)
            setGemsCount((prev) => Math.max(0, prev - finalGemsEarned))
            setQuestionsCompleted((prev) => prev - questionsCompleted)
            toast.error("Failed to save progress. Please try again.")
          })
          .finally(() => {
            setServerPending(false)
          })
      })
    }
  }, [
    isDrillCompleted,
    status,
    playFinish,
    isTimed,
    drillId,
    courseId,
    correctAnswersCount,
    totalAttempts,
    questionsCompleted,
    pointsEarned,
    openGemsModal,
    isCurrent,
  ])

  // Handle keyboard shortcuts
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
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => {
        return prev + 1
      })
      if (isTimed) {
        setQuestionsCompleted((prev) => prev + 1)
      }
      setSelectedOption(null)
      setShowExplanation(false)
      setStatus("none")
    } else {
      setStatus("completed")
      if (isTimed) {
        setQuestionsCompleted((prev) => prev + 1)
      }
    }
  }

  const onContinue = () => {
    if (!selectedOption && status !== "wrong") return

    if (isTimed) {
      if (status === "correct" || status === "wrong") {
        onNext()
        return
      }

      if (currentQuestionIndex === questions.length - 1) {
        setQuestionsCompleted((prev) => prev + 1)
      }

      const correct = selectedOption === currentQuestion.correctOption
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
      return
    }

    if (status === "correct") {
      onNext()
      return
    }

    const correct = selectedOption === currentQuestion.correctOption
    setTotalAttempts((prev) => prev + 1)

    if (correct) {
      setCorrectAnswersCount((prev) => prev + 1)
      playCorrect()
      setStatus("correct")
      setShowExplanation(true)
      const pointsForQuestion = app.POINTS_PER_QUESTION
      setPointsEarned((prev) => prev + pointsForQuestion)
      setGemsCount((prev) =>
        Math.min(prev + (isCurrent ? 0 : 1), app.GEMS_LIMIT)
      )
      setQuestionsCompleted((prev) => prev + 1)

      updateStats({
        drillId,
        courseId,
        isTimed,
        pointsEarned: pointsForQuestion,
        gemsEarned: isCurrent ? 0 : 1,
        questionsCompleted: 1,
        isDrillCompleted: false,
      })
    } else {
      playIncorrect()
      setStatus("wrong")
      setShowExplanation(true)

      if (isCurrent && !isPro) {
        setGemsCount((prev) => Math.max(0, prev - 1))
        updateStats({
          drillId,
          courseId,
          isTimed,
          gemsEarned: -1,
          questionsCompleted: 0,
          isDrillCompleted: false,
        })
          .then((response) => {
            if (response.error === "gems") {
              setGemsCount((prev) => Math.max(0, prev - 1))
              openGemsModal()
            }
          })
          .catch((error) => {
            console.error("updateStats failed in onContinue:", error)
          })
      }
    }
  }

  // Warn if insufficient questions
  if (questions.length < app.QUESTIONS_PER_DRILL && !isTimed && isCurrent) {
    logger.warn("Insufficient questions for drill:", {
      expected: app.QUESTIONS_PER_DRILL,
      received: questions.length,
    })
  }

  const expectedTime = app.QUESTIONS_PER_DRILL * app.SECONDS_PER_QUESTION

  const { resultMessage, showGreatJob } = useMemo(
    () =>
      getDrillResultMessage(
        isTimed,
        (correctAnswersCount / app.QUESTIONS_PER_DRILL) * 100,
        timeTaken,
        expectedTime
      ),
    [isTimed, correctAnswersCount, timeTaken, expectedTime]
  )

  const timeStatus = useMemo(
    () =>
      getDrillTimeStatus(
        timeTaken,
        expectedTime,
        (correctAnswersCount / app.QUESTIONS_PER_DRILL) * 100
      ),
    [timeTaken, expectedTime, correctAnswersCount]
  )

  if (isDrillCompleted) {
    const scorePercentage = isTimed
      ? Math.round((correctAnswersCount / app.QUESTIONS_PER_DRILL) * 100)
      : totalAttempts > 0
        ? Math.round((correctAnswersCount / totalAttempts) * 100)
        : 0
    return (
      <>
        <ReactConfetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10000}
        />
        <div className="flex flex-col">
          <div
            className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-y-4
              text-center lg:gap-y-8"
          >
            <Image
              src="/images/icons/finish.svg"
              height={100}
              width={100}
              alt="Finish"
              className="hidden lg:block"
            />
            <Image
              src="/images/icons/finish.svg"
              height={50}
              width={50}
              alt="Finish"
              className="block lg:hidden"
            />
            <h1 className="text-xl font-bold text-neutral-700 lg:text-3xl dark:text-neutral-300">
              {showGreatJob && "Great job!"}
              {showGreatJob && <br />}
              {resultMessage}
            </h1>
            <p className="text-lg font-semibold text-neutral-600 lg:text-xl dark:text-neutral-400">
              {timeStatus}
            </p>
            <div className="flex w-full flex-col items-center gap-y-4 sm:flex-row sm:gap-x-4">
              <ResultCard
                variant="points"
                value={pointsEarned}
                caption="Points Earned"
              />
              <ResultCard
                variant="score"
                value={`${scorePercentage}%`}
                caption="Score"
              />
              <ResultCard variant="time" value={formattedTime} caption="Time" />
            </div>
          </div>
          <DrillFooter
            disabled={isUpdatePending || serverPending}
            isTimed={isTimed}
            status="completed"
            onCheck={handleDrillCompleteContinue}
          />
        </div>
      </>
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
        serverPending={serverPending || isUpdatePending}
        onTimerComplete={handleTimerComplete}
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
                      disabled={
                        status !== "none" || serverPending || isUpdatePending
                      }
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
        disabled={
          status === "none" &&
          (!selectedOption || serverPending || isUpdatePending)
        }
        isTimed={isTimed}
        status={status}
        onCheck={onContinue}
        explanation={showExplanation ? currentQuestion.explanation : null}
      />
    </>
  )
}

export default Drill
