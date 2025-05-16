"use client"

import { useRef } from "react"

import { QuestionBubble } from "@/app/exercise/question-bubble"
import { challengeOptions, challenges, userSubscription } from "@/db/schema"
import { useState, useTransition, useEffect, useMemo } from "react"
import { Challenge } from "@/app/exercise/challenge"
import { Footer } from "@/app/exercise/footer"
import { upsertChallengeProgress } from "@/app/actions/challenge-progress"
import { toast } from "sonner"
import { reduceGems } from "@/app/actions/user-progress"
import { useWindowSize, useMount } from "react-use"
import Image from "next/image"
import { ResultCard } from "@/app/exercise/result-card"
import { useRouter } from "next/navigation"
import ReactConfetti from "react-confetti"
import { useGemsModal } from "@/store/use-gems-modal"
import { usePracticeModal } from "@/store/use-practice-modal"
import app from "@/lib/data/app.json"
import { useQuizAudio } from "@/store/use-quiz-audio"
import { ExerciseHeader } from "@/app/exercise/exercise-header"

type Props = {
  initialExerciseId: number
  initialGems: number
  initialPercentage: number
  initialExerciseChallenges: (typeof challenges.$inferSelect & {
    completed: boolean
    challengeOptions: (typeof challengeOptions.$inferSelect)[]
  })[]
  userSubscription:
    | (typeof userSubscription.$inferSelect & {
        isActive: boolean
      })
    | null
  purpose?: "exercise" | "practice"
}

export const Quiz = ({
  initialExerciseId,
  initialGems,
  initialPercentage,
  initialExerciseChallenges,
  userSubscription,
  purpose = "exercise",
}: Props) => {
  const { open: openGemsModal } = useGemsModal()
  const { open: openPracticeModal } = usePracticeModal()
  const { playFinish, playCorrect, playIncorrect } = useQuizAudio()

  const hasPlayedFinishAudio = useRef(false)

  useMount(() => {
    if (purpose === "practice") {
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
  const [gems, setGems] = useState(initialGems)
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

      if (purpose === "practice" || initialPercentage === 100) {
        setGems((prev) => Math.min(prev + 1, app.GEMS_LIMIT))
      }

      setServerPending(true)
      upsertChallengeProgress(challenge.id)
        .then((response) => {
          if (response?.error === "gems") {
            setStatus("none")
            setSelectedOption(undefined)
            setPercentage((prev) => prev - 100 / challenges.length)
            if (purpose === "practice" || initialPercentage === 100) {
              setGems((prev) => Math.max(prev - 1, 0))
            }
            openGemsModal()
          }
        })
        .catch(() => {
          setStatus("none")
          setSelectedOption(undefined)
          setPercentage((prev) => prev - 100 / challenges.length)
          if (purpose === "practice" || initialPercentage === 100) {
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

      if (purpose === "exercise" && !userSubscription?.isActive) {
        setGems((prev) => Math.max(prev - 1, 0))
      }

      setServerPending(true)
      reduceGems(challenge.id)
        .then((response) => {
          if (response?.error === "gems") {
            setStatus("none")
            setSelectedOption(undefined)
            if (purpose === "exercise" && !userSubscription?.isActive) {
              setGems((prev) => Math.min(prev + 1, app.GEMS_LIMIT))
            }
            openGemsModal()
          }
        })
        .catch(() => {
          setStatus("none")
          setSelectedOption(undefined)
          if (purpose === "exercise" && !userSubscription?.isActive) {
            setGems((prev) => Math.min(prev + 1, app.GEMS_LIMIT))
          }
          toast.error("Something went wrong. Please try again.")
        })
        .finally(() => {
          setServerPending(false)
        })
    }
  }

  // ✅ Play finish audio once when exercise is completed
  useEffect(() => {
    if (!challenge && !hasPlayedFinishAudio.current) {
      hasPlayedFinishAudio.current = true
      playFinish()
    }
  }, [challenge, playFinish])

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
        <div className="flex flex-col gap-y-4 lg:gap-y-8 max-w-lg mx-auto text-center justify-center items-center h-full">
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
          <h1 className="text-xl lg:text-3xl font-bold text-neutral-700 dark:text-neutral-300">
            Great job!
            <br />
            You’ve completed the exercise.
          </h1>
          <div className="flex items-center gap-x-4 w-full">
            <ResultCard variant="points" value={challenges.length * 10} />
            <ResultCard variant="gems" value={gems} />
          </div>
        </div>
        <Footer
          exerciseId={exerciseId}
          status="completed"
          onCheck={() => router.push("/learn")}
        />
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
      />
      <div className="flex-1">
        <div className="h-full items-center justify-center flex">
          <div className="lg:min-h-[350px] lg:w-[600px] w-full px-6 lg:px-0 flex flex-col gap-y-12">
            <h1 className="text-lg lg:text-3xl text-center lg:text-start font-bold text-neutral-700 dark:text-neutral-300">
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
        status={status}
        onCheck={onContinue}
      />
    </>
  )
}
