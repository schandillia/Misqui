"use client"

import { LessonHeader } from "@/app/lesson/lesson-header"
import { QuestionBubble } from "@/app/lesson/question-bubble"
import { challengeOptions, challenges, userSubscription } from "@/db/schema"
import { useState, useTransition } from "react"
import { Challenge } from "@/app/lesson/challenge"
import { Footer } from "@/app/lesson/footer"
import { upsertChallengeProgress } from "@/app/actions/challenge-progress"
import { toast } from "sonner"
import { reduceGems } from "@/app/actions/user-progress"
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
}

export const Quiz = ({
  initialLessonId,
  initialGems,
  initialPercentage,
  initialLessonChallenges,
  userSubscription,
}: Props) => {
  const { open: openGemsModal } = useGemsModal()
  const { open: openPracticeModal } = usePracticeModal()

  useMount(() => {
    if (initialPercentage === 100) {
      openPracticeModal()
    }
  })

  const { width, height } = useWindowSize()
  const router = useRouter()

  const [finishAudioEl, , finishControls] = useAudio({
    src: "/finish.wav",
    autoPlay: false,
  })
  const [correctAudioEl, , correctControls] = useAudio({
    src: "/correct.wav",
    autoPlay: false,
  })
  const [incorrectAudioEl, , incorrectControls] = useAudio({
    src: "/incorrect.wav",
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

  const [pending, startTransition] = useTransition()
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

    if (correctOption.id === selectedOption) {
      startTransition(() => {
        upsertChallengeProgress(challenge.id)
          .then((response) => {
            if (response?.error === "gems") {
              openGemsModal()
              return
            }
            correctControls.play()
            setStatus("correct")
            setPercentage((prev) => prev + 100 / challenges.length)

            if (initialPercentage === 100) {
              setGems((prev) => Math.min(prev + 1, app.GEMS_LIMIT))
            }
          })
          .catch(() => toast.error("Something went wrong. Please try again."))
      })
    } else {
      startTransition(() => {
        reduceGems(challenge.id)
          .then((response) => {
            if (response?.error === "gems") {
              openGemsModal()
              return
            }
            incorrectControls.play()
            setStatus("wrong")

            if (!response?.error) {
              setGems((prev) => Math.max(prev - 1, 0))
            }
          })
          .catch(() => toast.error("Something went wrong. Please try again."))
      })
    }
  }

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
            src="/finish.svg"
            height={100}
            width={100}
            alt="Finish"
            className="hidden lg:block"
          />
          <Image
            src="/finish.svg"
            height={50}
            width={50}
            alt="Finish"
            className="block lg:hidden"
          />
          <h1 className="text-xl lg:text-3xl font-bold text-neutral-700 dark:text-neutral-300">
            Great job!
            <br />
            You've completed the lesson.
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
                disabled={pending}
                challengeType={challenge.challengeType}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer
        disabled={pending || !selectedOption}
        status={status}
        onCheck={onContinue}
      />
    </>
  )
}
