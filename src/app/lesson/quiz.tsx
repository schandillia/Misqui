"use client"

import { LessonHeader } from "@/app/lesson/lesson-header"
import { QuestionBubble } from "@/app/lesson/question-bubble"
import { challengeOptions, challenges } from "@/db/schema"
import { useState } from "react"
import { Challenge } from "@/app/lesson/challenge"
import { Footer } from "@/app/lesson/footer"

type Props = {
  initialLessonId: number
  initialGems: number
  initialPercentage: number
  initialLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean
    challengeOptions: (typeof challengeOptions.$inferSelect)[]
  })[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userSubscription: any
}

export const Quiz = ({
  // initialLessonId,
  initialGems,
  initialPercentage,
  initialLessonChallenges,
  userSubscription,
}: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [gems, setGems] = useState(initialGems)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [percentage, setPercentage] = useState(initialPercentage)
  const [challenges] = useState(initialLessonChallenges)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeIndex, setActiveIndex] = useState(() => {
    const incompleteIndex = challenges.findIndex(
      (challenge) => !challenge.completed
    )
    return incompleteIndex === -1 ? 0 : incompleteIndex
  })

  const [selectedOption, setSelectedOption] = useState<number>()
  const [
    status,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setStatus,
  ] = useState<"correct" | "wrong" | "none">("none")

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

    if (correctOption && correctOption.id === selectedOption) {
      console.log("CORRECT!")
    } else {
      console.error("INCORRECT")
    }
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
      <div className="flex-1">
        <div className="h-full items-center justify-center flex">
          <div className="lg:min-h-[350px] lg:w-[600px] w-full px-6 lg:px-0 flex flex-col gap-y-12">
            <h1 className="text-lg lg:text-3xl text-center lg:text-start font-bold text-neutral-700">
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
                disabled={false}
                challengeType={challenge.challengeType}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer disabled={!selectedOption} status={status} onCheck={onContinue} />
    </>
  )
}
