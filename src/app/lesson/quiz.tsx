"use client"

import { LessonHeader } from "@/app/lesson/lesson-header"
import { QuestionBubble } from "@/app/lesson/question-bubble"
import { challengeOptions, challenges, userSubscription } from "@/db/schema"
import { useState, useTransition, useEffect } from "react"
import { Challenge } from "@/app/lesson/challenge"
import { Footer } from "@/app/lesson/footer"
import { upsertChallengeProgress } from "@/app/actions/challenge-progress"
import { toast } from "sonner"
import {
  reduceGems,
  updateStreakAfterLesson,
} from "@/app/actions/user-progress"
import { useAudio, useWindowSize, useMount } from "react-use"
import Image from "next/image"
import { ResultCard } from "@/app/lesson/result-card"
import { useRouter } from "next/navigation"
import ReactConfetti from "react-confetti"
import { useGemsModal } from "@/store/use-gems-modal"
import { usePracticeModal } from "@/store/use-practice-modal"
import app from "@/lib/data/app.json"

type Props = {
  initialLessonId: number
  initialGems: number
  initialPercentage: number
  initialLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean
    challengeOptions: (typeof challengeOptions.$inferSelect)[]
  })[]
  userSubscription:
    | (typeof userSubscription.$inferSelect & {
        isActive: boolean
      })
    | null
  purpose?: "lesson" | "practice"
}

export const Quiz = ({
  initialLessonId,
  initialGems,
  initialPercentage,
  initialLessonChallenges,
  userSubscription,
  purpose = "lesson",
}: Props) => {
  const { open: openGemsModal } = useGemsModal()
  const { open: openPracticeModal } = usePracticeModal()

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

  const [finishAudioEl, , finishControls] = useAudio({
    src: "/audio/effects/finish.wav",
    autoPlay: false,
  })
  const [correctAudioEl, , correctControls] = useAudio({
    src: "/audio/effects/correct.wav",
    autoPlay: false,
  })
  const [incorrectAudioEl, , incorrectControls] = useAudio({
    src: "/audio/effects/incorrect.wav",
    autoPlay: false,
  })

  // Function to conditionally render audio elements
  const renderAudioElements = () => (
    <>
      {finishAudioEl && finishAudioEl}
      {correctAudioEl && correctAudioEl}
      {incorrectAudioEl && incorrectAudioEl}
    </>
  )

  const [pending] = useTransition()
  const [serverPending, setServerPending] = useState(false)
  const [lessonId] = useState(initialLessonId)
  const [gems, setGems] = useState(initialGems)
  const [percentage, setPercentage] = useState(() => {
    return initialPercentage === 100 ? 0 : initialPercentage
  })
  const [challenges] = useState(initialLessonChallenges)
  const [activeIndex, setActiveIndex] = useState(() => {
    const incompleteIndex = challenges.findIndex(
      (challenge) => !challenge.completed
    )
    return incompleteIndex === -1 ? 0 : incompleteIndex
  })

  const [selectedOption, setSelectedOption] = useState<number>()
  const [status, setStatus] = useState<"correct" | "wrong" | "none">("none")

  const challenge = challenges[activeIndex]
  const options = challenge?.challengeOptions ?? []

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

    // Optimistically update UI
    if (correctOption.id === selectedOption) {
      correctControls.play()
      setStatus("correct")
      setPercentage((prev) => prev + 100 / challenges.length)

      // In practice mode, always increase gems on correct answer
      // In lesson mode, only increase gems if lesson was already completed
      if (purpose === "practice" || initialPercentage === 100) {
        setGems((prev) => Math.min(prev + 1, app.GEMS_LIMIT))
      }

      // Update database in background without blocking UI
      setServerPending(true)
      upsertChallengeProgress(challenge.id)
        .then((response) => {
          if (response?.error === "gems") {
            // Revert optimistic update if there's an error
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
          // Revert optimistic update on error
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
      incorrectControls.play()
      setStatus("wrong")

      // Only reduce gems in lesson mode and if user doesn't have subscription
      if (purpose === "lesson" && !userSubscription?.isActive) {
        setGems((prev) => Math.max(prev - 1, 0))
      }

      // Update database in background without blocking UI
      setServerPending(true)
      reduceGems(challenge.id)
        .then((response) => {
          if (response?.error === "gems") {
            // Revert optimistic update if there's an error
            setStatus("none")
            setSelectedOption(undefined)
            if (purpose === "lesson" && !userSubscription?.isActive) {
              setGems((prev) => Math.min(prev + 1, app.GEMS_LIMIT))
            }
            openGemsModal()
          }
        })
        .catch(() => {
          // Revert optimistic update on error
          setStatus("none")
          setSelectedOption(undefined)
          if (purpose === "lesson" && !userSubscription?.isActive) {
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
    if (!challenge && purpose === "lesson") {
      updateStreakAfterLesson(lessonId)
    }
  }, [challenge, lessonId, purpose])

  if (!challenge) {
    finishControls.play()

    return (
      <>
        {renderAudioElements()}
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
            You&#8217;ve completed the lesson.
          </h1>
          <div className="flex items-center gap-x-4 w-full">
            <ResultCard variant="points" value={challenges.length * 10} />
            <ResultCard variant="gems" value={gems} />
          </div>
        </div>
        <Footer
          lessonId={lessonId}
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
      {renderAudioElements()}
      <LessonHeader
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
