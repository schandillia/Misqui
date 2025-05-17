// @/app/lesson/components/quiz.tsx
"use client"

import { useRef } from "react"
import { QuestionBubble } from "@/app/lesson/components/question-bubble"
import { challengeOptions, challenges, userSubscription } from "@/db/schema"
import { useState, useTransition, useEffect, useMemo } from "react"
import { Challenge } from "@/app/lesson/components/challenge"
import { Footer } from "@/app/lesson/components/footer"
import { upsertChallengeProgress } from "@/app/actions/challenge-progress"
import { toast } from "sonner"
import { reduceGems } from "@/app/actions/user-progress"
import { useWindowSize, useMount } from "react-use"
import Image from "next/image"
import { ResultCard } from "@/app/lesson/components/result-card"
import { useRouter } from "next/navigation"
import ReactConfetti from "react-confetti"
import { useGemsModal } from "@/store/use-gems-modal"
import { usePracticeModal } from "@/store/use-practice-modal"
import app from "@/lib/data/app.json"
import { useQuizAudio } from "@/store/use-quiz-audio"
import { ExerciseHeader } from "@/app/lesson/components/exercise-header"

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
  const { playFinish, playCorrect, playIncorrect } = useQuizAudio()

  const hasPlayedFinishAudio = useRef(false)

  useMount(() => {
    if (initialIsTimed) return // Skip modal logic entirely for timed lessons

    if (isPractice) {
      const SIX_HOURS = 6 * 60 * 60 * 1000
      const key = "practiceModalLastShown"
      const lastShown = Number(localStorage.getItem(key) || 0)
      const now = Date.now()

      if (now - lastShown > SIX_HOURS) {
        openPracticeModal()
        localStorage.setItem(key, now.toString())
      }
    } else if (initialPercentage === 100) {
      openPracticeModal()
    }
  })

  const { width, height } = useWindowSize()
  const router = useRouter()

  const [pending] = useTransition()
  const [serverPending, setServerPending] = useState(false)
  const [exerciseId] = useState(initialExerciseId)
  const [lessonId] = useState(initialLessonId)
  const [gems, setGems] = useState(initialGems)
  const [points, setPoints] = useState(initialPoints)
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

  const challenge = challenges[activeIndex]
  const options = useMemo(() => challenge?.challengeOptions ?? [], [challenge])

  const onNext = () => {
    setActiveIndex((current) => current + 1)
  }

  const onSelect = (id: number) => {
    if (status !== "none") return
    setSelectedOption(id)
  }

  const onContinue = () => {
    if (!selectedOption) return

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
      setPercentage((prev) => prev + 100 / challenges.length)
      setPoints((prev) => prev + app.POINTS_PER_CHALLENGE)

      if (isPractice || initialPercentage === 100) {
        setGems((prev) => Math.min(prev + 1, app.GEMS_LIMIT))
      }

      setServerPending(true)
      upsertChallengeProgress(challenge.id)
        .then((response) => {
          if (response?.error === "gems") {
            setStatus("none")
            setSelectedOption(undefined)
            setPercentage((prev) => prev - 100 / challenges.length)
            setPoints((prev) => prev - app.POINTS_PER_CHALLENGE)
            if (isPractice || initialPercentage === 100) {
              setGems((prev) => Math.max(prev - 1, 0))
            }
            openGemsModal()
          }
        })
        .catch((error) => {
          console.error("Error in upsertChallengeProgress:", error)
          setStatus("none")
          setSelectedOption(undefined)
          setPercentage((prev) => prev - 100 / challenges.length)
          setPoints((prev) => prev - app.POINTS_PER_CHALLENGE)
          if (isPractice || initialPercentage === 100) {
            setGems((prev) => Math.max(prev - 1, 0))
          }
          toast.error("Something went wrong. Please try again.")
        })
        .finally(() => {
          setServerPending(false)
        })
    } else {
      playIncorrect()
      setStatus("wrong")

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
          console.error("Error in reduceGems:", error)
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

  useEffect(() => {
    if (!challenge && !hasPlayedFinishAudio.current) {
      hasPlayedFinishAudio.current = true
      playFinish()
    }
  }, [challenge, playFinish])

  const isExerciseCompleted = !challenge

  if (!challenge) {
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
          <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-y-4 text-center lg:gap-y-8">
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
              Great job!
              <br />
              You’ve completed the exercise.
            </h1>
            <div className="flex w-full items-center gap-x-4">
              <ResultCard variant="points" value={points} />{" "}
              {/* Use total points */}
              <ResultCard variant="gems" value={gems} />
            </div>
          </div>
          <Footer
            lessonId={lessonId}
            exerciseId={exerciseId}
            isTimed={initialIsTimed}
            status="completed"
            onCheck={() => router.push("/learn")}
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
      />
      <div className="flex-1">
        <div className="flex h-full items-center justify-center">
          <div className="flex w-full flex-col gap-y-12 px-6 lg:min-h-[350px] lg:w-[600px] lg:px-0">
            <h1 className="text-center text-lg font-bold text-neutral-700 lg:text-start lg:text-3xl dark:text-neutral-300">
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
        disabled={status === "none" && (pending || !selectedOption)}
        isTimed={initialIsTimed}
        status={status}
        onCheck={onContinue}
      />
    </>
  )
}
