"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { LessonHeader } from "@/app/lesson/lesson-header"
import { QuestionBubble } from "@/app/lesson/question-bubble"
import { challengeOptions, challenges, userSubscription } from "@/db/schema"
import { useTransition, useMemo } from "react"
import { Challenge } from "@/app/lesson/challenge"
import { Footer } from "@/app/lesson/footer"
import { upsertChallengeProgress } from "@/app/actions/challenge-progress"
import {
  markLessonCompleteAndUpdateStreak,
  getCurrentUserId,
  updateUserGems,
  updateUserPoints,
} from "@/app/actions/user-progress"
import { toast } from "sonner"
import { reduceGems } from "@/app/actions/user-progress"
import { useWindowSize, useMount } from "react-use"
import Image from "next/image"
import { ResultCard } from "@/app/lesson/result-card"
import { useRouter } from "next/navigation"
import ReactConfetti from "react-confetti"
import { useGemsModal } from "@/store/use-gems-modal"
import { usePracticeModal } from "@/store/use-practice-modal"
import app from "@/lib/data/app.json"
import { useQuizAudio } from "@/store/use-quiz-audio"
import { CountdownTimer } from "@/components/countdown-timer"

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
  isTimed?: boolean
}

export const Quiz = ({
  initialLessonId,
  initialGems,
  initialPercentage,
  initialLessonChallenges,
  userSubscription,
  purpose = "lesson",
  isTimed = false,
}: Props) => {
  const { open: openGemsModal } = useGemsModal()
  const { open: openPracticeModal } = usePracticeModal()
  const { playFinish, playCorrect, playIncorrect } = useQuizAudio()

  const hasPlayedFinishAudio = useRef(false)

  const [userId, setUserId] = useState<string | null>(null)
  const [points, setPoints] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)

  useMount(() => {
    if (!isTimed) {
      if (purpose === "practice") {
        const SIX_HOURS = 6 * 60 * 60 * 1000
        const key = "practiceModalLastShown"
        const lastShown = Number(localStorage.getItem(key) || 0)
        const now = Date.now()

        if (now - lastShown > SIX_HOURS) {
          openPracticeModal()
          localStorage.setItem(key, now.toString())
        }
      }
    }

    const fetchUserId = async () => {
      try {
        const id = await getCurrentUserId()
        console.log("Fetched userId:", id)
        setUserId(id)
      } catch (error) {
        console.error("Failed to fetch userId:", error)
        toast.error("Failed to fetch user ID. Please try again.")
      }
    }
    fetchUserId()
  })

  const { width, height } = useWindowSize()
  const router = useRouter()

  const [pending] = useTransition()
  const [lessonId] = useState(initialLessonId)
  const [gems, setGems] = useState(initialGems)
  const [percentage, setPercentage] = useState(() =>
    initialPercentage === 100 ? 0 : initialPercentage
  )
  const [challenges] = useState(initialLessonChallenges)
  const [activeIndex, setActiveIndex] = useState(() => {
    const incompleteIndex = challenges.findIndex(
      (challenge) => !challenge.completed
    )
    return incompleteIndex === -1 ? 0 : incompleteIndex
  })
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([])

  const [selectedOption, setSelectedOption] = useState<number>()
  const [status, setStatus] = useState<"correct" | "wrong" | "none">("none")
  const [isDbUpdateComplete, setIsDbUpdateComplete] = useState(false)
  const [isReadyForFinishScreen, setIsReadyForFinishScreen] = useState(false)

  // Synchronous tracking of processed challenges and processing state
  const processedChallengesRef = useRef(new Set<number>())
  const isProcessingRef = useRef(false)
  const isTransitioningRef = useRef(false)
  const hasProcessedRef = useRef(false)

  const challenge = challenges[activeIndex]
  const options = useMemo(() => challenge?.challengeOptions ?? [], [challenge])

  const isLastChallenge = activeIndex === challenges.length - 1
  const isLessonCompleted = !challenge && isReadyForFinishScreen

  const onNext = () => {
    setActiveIndex((current) => current + 1)
    hasProcessedRef.current = false // Reset for the next challenge
    isTransitioningRef.current = false
  }

  const onSelect = (id: number) => {
    if (status !== "none") return
    setSelectedOption(id)
  }

  const handleContinue = async (eventType: string) => {
    if (!selectedOption) return

    if (isProcessingRef.current) {
      console.log(
        `handleContinue blocked: already processing (event: ${eventType})`
      )
      return
    }
    isProcessingRef.current = true
    console.log(
      `handleContinue called for challenge ${challenge?.id}, event: ${eventType}, status: ${status}`
    )

    try {
      if (status === "wrong") {
        if (isTimed) {
          setPercentage((prev) => prev + 100 / challenges.length)
          if (isLastChallenge) {
            setTimeout(() => {
              onNext()
              setIsReadyForFinishScreen(true)
            }, 100)
          } else {
            onNext()
          }
          setStatus("none")
          setSelectedOption(undefined)
          return
        } else {
          setStatus("none")
          setSelectedOption(undefined)
          hasProcessedRef.current = false
          isTransitioningRef.current = false
          return
        }
      }

      if (status === "correct") {
        const isLastChallengeHere = activeIndex === challenges.length - 1

        if (
          isLastChallengeHere &&
          isTimed &&
          correctAnswers === challenges.length
        ) {
          if (isUpdating) {
            return
          }

          setPercentage((prev) => prev + 100 / challenges.length)

          setIsUpdating(true)
          try {
            for (const challengeId of completedChallenges) {
              console.log(
                "Updating challenge progress for challengeId:",
                challengeId
              )
              await upsertChallengeProgress(challengeId, isTimed)
            }
            console.log("Marking lesson complete and updating streak...")
            await markLessonCompleteAndUpdateStreak(userId!, lessonId)
            console.log(
              "Updating points with TIMED_LESSON_REWARD:",
              app.TIMED_LESSON_REWARD
            )
            const newPoints = await updateUserPoints(app.TIMED_LESSON_REWARD)
            console.log("Points updated successfully, newPoints:", newPoints)
            setPoints(newPoints)
          } catch (error) {
            console.error("Error completing timed lesson:", error)
            toast.error("Failed to mark lesson as complete. Please try again.")
            return
          } finally {
            setIsUpdating(false)
            setIsDbUpdateComplete(true)
          }

          setTimeout(() => {
            onNext()
            setIsReadyForFinishScreen(true)
          }, 100)
          setStatus("none")
          setSelectedOption(undefined)
          return
        }

        setPercentage((prev) => prev + 100 / challenges.length)
        if (isLastChallengeHere) {
          if (!isTimed) {
            if (isUpdating) {
              return
            }

            setIsUpdating(true)
            try {
              for (const challengeId of completedChallenges) {
                console.log(
                  "Updating challenge progress for challengeId:",
                  challengeId
                )
                await upsertChallengeProgress(challengeId, isTimed)
              }
              console.log(
                "Marking lesson complete and updating streak for non-timed lesson..."
              )
              await markLessonCompleteAndUpdateStreak(userId!, lessonId)
            } catch (error) {
              console.error("Error completing non-timed lesson:", error)
              toast.error(
                "Failed to mark lesson as complete. Please try again."
              )
              return
            } finally {
              setIsUpdating(false)
            }
          }

          setTimeout(() => {
            onNext()
            setIsReadyForFinishScreen(true)
          }, 100)
        } else {
          onNext()
        }
        setStatus("none")
        setSelectedOption(undefined)
        return
      }

      const correctOption = options.find((option) => option.correct)
      if (!correctOption) return

      if (correctOption.id === selectedOption) {
        if (processedChallengesRef.current.has(challenge.id)) {
          console.log(`Challenge ${challenge.id} already processed, skipping`)
          setStatus("correct")
          setCorrectAnswers((prev) => prev + 1)
          return
        }

        playCorrect().catch((error: unknown) => {
          console.warn("Failed to play correct sound:", error)
        })
        isTransitioningRef.current = true // Mark as transitioning
        setStatus("correct")
        setCorrectAnswers((prev) => prev + 1)

        processedChallengesRef.current.add(challenge.id)
        hasProcessedRef.current = true
        console.log(`Challenge ${challenge.id} marked as processed`)

        if (!isTimed) {
          // Optimistic updates
          if (purpose === "practice") {
            setGems((prev) => prev + 1)
          }
          setPoints((prev) => prev + app.POINTS_PER_CORRECT_ANSWER)

          // Background database updates with deduplication
          const gemPromise: Promise<number> =
            purpose === "practice"
              ? updateUserGems(1).then((updatedGems) => {
                  setGems(updatedGems)
                  return updatedGems
                })
              : Promise.resolve(gems)

          const upsertPromise: Promise<{ error: string } | undefined> =
            upsertChallengeProgress(challenge.id, isTimed)

          const pointsPromise: Promise<number> = updateUserPoints(
            app.POINTS_PER_CORRECT_ANSWER
          ).then((updatedPoints) => {
            setPoints(updatedPoints)
            return updatedPoints
          })

          const updatePromises: [
            Promise<number>,
            Promise<{ error: string } | undefined>,
            Promise<number>
          ] = [gemPromise, upsertPromise, pointsPromise]

          Promise.all(updatePromises)
            .then(
              ([updatedGems, upsertResponse, updatedPoints]: [
                number,
                { error: string } | undefined,
                number
              ]) => {
                if (upsertResponse && upsertResponse.error === "gems") {
                  setStatus("none")
                  setSelectedOption(undefined)
                  setPercentage((prev) => prev - 100 / challenges.length)
                  if (purpose === "practice") {
                    setGems((prev) => prev - 1)
                  }
                  openGemsModal()
                }
              }
            )
            .catch((error) => {
              console.error("Failed to update progress:", error)
              toast.error("Failed to update progress. Values may be incorrect.")
              setStatus("none")
              setSelectedOption(undefined)
              setPercentage((prev) => prev - 100 / challenges.length)
              if (purpose === "practice") {
                setGems((prev) => prev - 1)
              }
              setPoints((prev) => prev - app.POINTS_PER_CORRECT_ANSWER)
            })
        } else {
          setCompletedChallenges((prev) => [...prev, challenge.id])
        }
      } else {
        playIncorrect().catch((error: unknown) => {
          console.warn("Failed to play incorrect sound:", error)
        })
        setStatus("wrong")

        if (!isTimed) {
          if (purpose === "lesson" && !userSubscription?.isActive) {
            setGems((prev) => Math.max(prev - 1, 0))
          }

          Promise.all([
            reduceGems(challenge.id).then((response) => {
              if (response?.error === "gems") {
                setStatus("none")
                setSelectedOption(undefined)
                if (purpose === "lesson" && !userSubscription?.isActive) {
                  setGems((prev) => Math.min(prev + 1, app.GEMS_LIMIT))
                }
                openGemsModal()
              }
              return response
            }),
          ]).catch((error) => {
            console.error("Failed to reduce gems:", error)
            setStatus("none")
            setSelectedOption(undefined)
            if (purpose === "lesson" && !userSubscription?.isActive) {
              setGems((prev) => Math.min(prev + 1, app.GEMS_LIMIT))
            }
            toast.error("Something went wrong. Please try again.")
          })
        }
      }
    } finally {
      isProcessingRef.current = false
      console.log(
        `handleContinue finished for challenge ${challenge?.id}, processing reset`
      )
    }
  }

  const onContinue = useCallback(
    (event?: React.MouseEvent | KeyboardEvent) => {
      const eventType = event
        ? event instanceof KeyboardEvent
          ? "keydown"
          : "click"
        : "unknown"
      console.log(
        `onContinue called with event: ${eventType}, status: ${status}, hasProcessed: ${hasProcessedRef.current}, isTransitioning: ${isTransitioningRef.current}`
      )

      if (hasProcessedRef.current || isTransitioningRef.current) {
        console.log(
          `onContinue blocked: challenge already processed or transitioning (event: ${eventType})`
        )
        return
      }
      if (isProcessingRef.current) {
        console.log(
          `onContinue blocked: already processing (event: ${eventType})`
        )
        return
      }
      handleContinue(eventType)
    },
    [
      selectedOption,
      status,
      isTimed,
      isLastChallenge,
      isUpdating,
      userId,
      lessonId,
      challenges,
      purpose,
      gems,
      points,
    ]
  )

  // Handle "Enter" key press at the Quiz level
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        const isDisabled =
          (status === "none" && (pending || !selectedOption)) ||
          isUpdating ||
          isProcessingRef.current ||
          isTransitioningRef.current ||
          hasProcessedRef.current
        if (!isDisabled) {
          event.preventDefault()
          event.stopPropagation()
          console.log("Quiz keydown listener triggered")
          onContinue(event)
        } else {
          console.log("Enter key blocked: component is disabled")
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onContinue, status, pending, selectedOption, isUpdating])

  useEffect(() => {
    if (!challenge && !hasPlayedFinishAudio.current && userId) {
      hasPlayedFinishAudio.current = true
      playFinish().catch((error: unknown) => {
        console.warn("Failed to play finish sound:", error)
      })
    }
  }, [challenge, playFinish, userId])

  // Reset processedChallengesRef when the lesson restarts
  useEffect(() => {
    processedChallengesRef.current.clear()
    hasProcessedRef.current = false
    isTransitioningRef.current = false
  }, [initialLessonId])

  if (isLessonCompleted) {
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
            You’ve completed the lesson.
          </h1>
          <div className="flex items-center gap-x-4 w-full">
            <ResultCard
              variant="points"
              value={
                isTimed
                  ? correctAnswers === challenges.length
                    ? app.TIMED_LESSON_REWARD
                    : 0
                  : challenges.length * app.POINTS_PER_CORRECT_ANSWER
              }
            />
            <ResultCard variant="gems" value={gems} />
          </div>
        </div>
        <Footer
          lessonId={lessonId}
          status="completed"
          onCheck={() => router.push("/learn")}
          isTimed={isTimed}
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
      <LessonHeader
        gems={gems}
        percentage={percentage}
        hasActiveSubscription={!!userSubscription?.isActive}
      />
      {isTimed && <CountdownTimer isLessonCompleted={isLessonCompleted} />}
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
                disabled={pending || status !== "none"}
                challengeType={challenge.challengeType}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer
        disabled={
          (status === "none" && (pending || !selectedOption)) ||
          isUpdating ||
          isProcessingRef.current ||
          isTransitioningRef.current ||
          hasProcessedRef.current
        }
        status={status}
        onCheck={onContinue}
        isTimed={isTimed}
      />
    </>
  )
}
