"use client"

import { useRef, useEffect } from "react"
import { QuestionBubble } from "@/app/lesson/components/question-bubble"
import { challengeOptions, challenges, userSubscription } from "@/db/schema"
import { useState, useTransition, useMemo } from "react"
import { Challenge } from "@/app/lesson/components/challenge"
import { Footer } from "@/app/lesson/components/footer"
import { upsertChallengeProgress } from "@/app/actions/challenge-progress"
import { reduceGems } from "@/app/actions/user-progress"
import { useWindowSize, useMount } from "react-use"
import Image from "next/image"
import { ResultCard } from "@/app/lesson/components/result-card"
import { useRouter } from "next/navigation"
import ReactConfetti from "react-confetti"
import { useGemsModal } from "@/store/use-gems-modal"
import { usePracticeModal } from "@/store/use-practice-modal"
import app from "@/lib/data/app.json"
import { awardTimedExerciseReward } from "@/app/actions/timed-exercise"
import { useQuizAudio } from "@/store/use-quiz-audio"
import { ExerciseHeader } from "@/app/lesson/components/exercise-header"
import {
  getTimeCaption,
  getTimeStatus,
  getResultMessage,
} from "@/app/lesson/utils/quiz-utils"
import { getSoundPreference } from "@/app/actions/get-user-sound-preference"
import toast from "react-hot-toast"

type Props = {
  initialLessonId: number
  initialExerciseId: number
  initialGems: number
  initialPoints: number
  initialPercentage: number
  initialExerciseChallenges: (typeof challenges.$inferSelect & {
    completed: boolean
    challengeOptions: (typeof challengeOptions.$inferSelect)[]
  })[]
  initialExerciseTitle: string
  initialExerciseNumber: number
  initialIsTimed: boolean
  userSubscription:
    | (typeof userSubscription.$inferSelect & {
        isActive: boolean
      })
    | null
  isPractice?: boolean
}

export const Quiz = ({
  initialLessonId,
  initialExerciseId,
  initialGems,
  initialPoints,
  initialPercentage,
  initialExerciseChallenges,
  initialExerciseTitle,
  initialExerciseNumber,
  initialIsTimed,
  userSubscription,
  isPractice = false,
}: Props) => {
  const { open: openGemsModal } = useGemsModal()
  const { open: openPracticeModal } = usePracticeModal()
  const { playFinish, playCorrect, playIncorrect, setSoundEnabled } =
    useQuizAudio()

  const hasPlayedFinishAudio = useRef(false)
  const [isRewardPending, startRewardTransition] = useTransition()

  useMount(() => {
    if (initialIsTimed) return
    if (isPractice) {
      const key = "practiceModalLastShown"
      const lastShown = Number(localStorage.getItem(key) || 0)
      const now = Date.now()
      if (
        now - lastShown >
        app.HOURS_BETWEEN_PRACTICE_MODALS * 60 * 60 * 1000
      ) {
        openPracticeModal()
        localStorage.setItem(key, now.toString())
      }
    } else if (initialPercentage === 100) {
      openPracticeModal()
    }
  })

  // Fetch sound preference on mount
  useEffect(() => {
    getSoundPreference().then(({ soundEnabled }) => {
      setSoundEnabled(soundEnabled)
    })
  }, [setSoundEnabled])

  const { width, height } = useWindowSize()
  const router = useRouter()

  const handleQuizCompleteContinue = () => {
    router.refresh()
    router.push("/learn")
  }

  const [pending] = useTransition()
  const [serverPending, setServerPending] = useState(false)
  const [exerciseId] = useState(initialExerciseId)
  const [lessonId] = useState(initialLessonId)
  const [gems, setGems] = useState(initialGems)
  const [points, setPoints] = useState(initialPoints)
  const [pointsEarned, setPointsEarned] = useState(0)
  const [percentage, setPercentage] = useState(() =>
    initialPercentage === 100 ? 0 : initialPercentage
  )
  const [challenges] = useState(initialExerciseChallenges)
  const [activeIndex, setActiveIndex] = useState(() => {
    const incompleteIndex = challenges.findIndex(
      (challenge) => !challenge.completed
    )
    return incompleteIndex === -1 ? 0 : incompleteIndex
  })
  const [selectedOption, setSelectedOption] = useState<number>()
  const [status, setStatus] = useState<"correct" | "wrong" | "none">("none")
  const [correctAttempts, setCorrectAttempts] = useState(0)
  const [incorrectAttempts, setIncorrectAttempts] = useState(0)
  const [timeTaken, setTimeTaken] = useState(0)

  const challenge = challenges[activeIndex]
  const isExerciseCompleted = !challenge
  const options = useMemo(() => challenge?.challengeOptions ?? [], [challenge])
  const isTimerPaused = status === "none" && (pending || serverPending)

  const totalAttempts = correctAttempts + incorrectAttempts
  const scorePercentage =
    totalAttempts > 0
      ? parseFloat(((correctAttempts / totalAttempts) * 100).toFixed(1))
      : 0

  const expectedTime = app.CHALLENGES_PER_EXERCISE * app.SECONDS_PER_CHALLENGE

  const timeCaption = useMemo(
    () => getTimeCaption(timeTaken, expectedTime),
    [timeTaken, expectedTime]
  )

  const timeStatus = useMemo(
    () => getTimeStatus(timeTaken, expectedTime, scorePercentage),
    [timeTaken, expectedTime, scorePercentage]
  )

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeTaken / 60)
    const seconds = timeTaken % 60
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }, [timeTaken])

  useEffect(() => {
    if (isExerciseCompleted || isTimerPaused) return

    const timer = setInterval(() => {
      setTimeTaken((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isExerciseCompleted, isTimerPaused])

  const onNext = () => {
    setActiveIndex((current) => current + 1)
  }

  const onSelect = (id: number) => {
    if (status !== "none") return
    setSelectedOption(id)
  }

  const onContinue = () => {
    if (!selectedOption && status !== "wrong") return

    if (initialIsTimed) {
      const correctOption = options.find((option) => option.correct)
      if (!correctOption) return

      if (status === "correct" || status === "wrong") {
        onNext()
        setStatus("none")
        setSelectedOption(undefined)
        return
      }

      setPercentage((prev) => prev + 100 / challenges.length)

      if (correctOption.id === selectedOption) {
        playCorrect()
        setStatus("correct")
        setCorrectAttempts((prev) => prev + 1)
      } else {
        playIncorrect()
        setStatus("wrong")
        setIncorrectAttempts((prev) => prev + 1)
      }
      return
    }

    if (status === "wrong") {
      setStatus("none")
      setSelectedOption(undefined)
      return
    }

    if (status === "correct") {
      onNext()
      setStatus("none")
      setSelectedOption(undefined)
      return
    }

    const correctOption = options.find((option) => option.correct)
    if (!correctOption) return

    if (correctOption.id === selectedOption) {
      playCorrect()
      setStatus("correct")
      setCorrectAttempts((prev) => prev + 1)
      setPercentage((prev) => prev + 100 / challenges.length)
      if (!initialIsTimed) {
        setPoints((prev) => prev + app.POINTS_PER_CHALLENGE)
        setPointsEarned((prev) => prev + app.POINTS_PER_CHALLENGE)
        if (isPractice || initialPercentage === 100) {
          setGems((prev) => Math.min(prev + 1, app.GEMS_LIMIT))
        }
      }

      if (!initialIsTimed) {
        setServerPending(true)
        upsertChallengeProgress(challenge.id)
          .then((response) => {
            if (response?.error === "gems") {
              setStatus("none")
              setSelectedOption(undefined)
              setPercentage((prev) => prev - 100 / challenges.length)
              setPoints((prev) => prev - app.POINTS_PER_CHALLENGE)
              setPointsEarned((prev) => prev - app.POINTS_PER_CHALLENGE)
              setCorrectAttempts((prev) => prev - 1)
              openGemsModal()
            }
          })
          .catch((error) => {
            setStatus("none")
            setSelectedOption(undefined)
            setPercentage((prev) => prev - 100 / challenges.length)
            setPoints((prev) => prev - app.POINTS_PER_CHALLENGE)
            setPointsEarned((prev) => prev - app.POINTS_PER_CHALLENGE)
            setCorrectAttempts((prev) => prev - 1)
            toast.error("Something went wrong. Please try again.")
          })
          .finally(() => {
            setServerPending(false)
          })
      }
    } else {
      playIncorrect()
      setStatus("wrong")
      setIncorrectAttempts((prev) => prev + 1)

      if (!initialIsTimed) {
        if (!isPractice && !userSubscription?.isActive) {
          setGems((prev) => Math.max(prev - 1, 0))
        }

        setServerPending(true)
        reduceGems(challenge.id)
          .then((response) => {
            if (response?.error === "gems") {
              setStatus("none")
              setSelectedOption(undefined)
              if (!isPractice && !userSubscription?.isActive) {
                setGems((prev) => Math.min(prev + 1, app.GEMS_LIMIT))
              }
              openGemsModal()
            }
          })
          .catch((error) => {
            setStatus("none")
            setSelectedOption(undefined)
            if (!isPractice && !userSubscription?.isActive) {
              setGems((prev) => Math.min(prev + 1, app.GEMS_LIMIT))
            }
            toast.error("Something went wrong. Please try again.")
          })
          .finally(() => {
            setServerPending(false)
          })
      }
    }
  }

  useEffect(() => {
    if (isExerciseCompleted && !hasPlayedFinishAudio.current) {
      hasPlayedFinishAudio.current = true
      playFinish()

      if (initialIsTimed) {
        if (scorePercentage === 100) {
          setPointsEarned(app.REWARD_POINTS_FOR_TIMED)
        } else {
          setPointsEarned(0)
        }

        startRewardTransition(() => {
          awardTimedExerciseReward(initialExerciseId, scorePercentage)
            .then((response) => {
              if (response && typeof response.pointsAwarded === "number") {
                setPointsEarned(response.pointsAwarded)
              }
              if (response?.error === "not_timed_exercise") {
                toast.error("This exercise is not timed.")
              }
            })
            .catch(() => {
              toast.error("Failed to process timed exercise reward.")
            })
        })
      }
    }
  }, [
    isExerciseCompleted,
    playFinish,
    initialIsTimed,
    initialExerciseId,
    scorePercentage,
    startRewardTransition,
  ])

  if (isExerciseCompleted) {
    const { resultMessage, showGreatJob } = getResultMessage(
      initialIsTimed,
      scorePercentage,
      timeTaken,
      expectedTime
    )

    return (
      <>
        <ReactConfetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10000}
        />
        <div className="flex min-h-screen flex-col">
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
              <ResultCard
                variant="time"
                value={formattedTime}
                caption={timeCaption}
              />
            </div>
          </div>
          <Footer
            lessonId={lessonId}
            exerciseId={exerciseId}
            isTimed={initialIsTimed}
            status="completed"
            onCheck={handleQuizCompleteContinue}
          />
        </div>
      </>
    )
  }

  const title =
    challenge.challengeType === "ASSIST"
      ? "Select the correct option"
      : challenge.question

  return (
    <>
      <ExerciseHeader
        gems={gems}
        percentage={percentage}
        hasActiveSubscription={!!userSubscription?.isActive}
        exerciseTitle={initialExerciseTitle}
        exerciseNumber={initialExerciseNumber}
        isTimed={initialIsTimed}
        isExerciseCompleted={isExerciseCompleted}
        isTimerPaused={isTimerPaused}
      />
      <div className="flex-1">
        <div className="flex h-full items-center justify-center">
          <div className="flex w-full flex-col gap-y-12 px-6 lg:min-h-[350px] lg:w-[600px] lg:px-0">
            <h1
              className="text-center text-lg font-bold text-neutral-700 lg:text-start lg:text-3xl
                dark:text-neutral-300"
            >
              {title}
            </h1>
            <div>
              {challenge.challengeType === "ASSIST" && (
                <QuestionBubble question={challenge.question} />
              )}
              <Challenge
                options={options}
                onSelect={onSelect}
                status={status}
                selectedOption={selectedOption}
                disabled={status === "none" && (pending || serverPending)}
                challengeType={challenge.challengeType}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer
        disabled={
          (status === "none" &&
            (pending || !selectedOption || serverPending)) ||
          isRewardPending
        }
        isTimed={initialIsTimed}
        status={status}
        onCheck={onContinue}
      />
    </>
  )
}
