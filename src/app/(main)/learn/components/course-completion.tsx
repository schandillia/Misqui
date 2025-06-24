"use client"

import { useState } from "react"
import Confetti from "react-confetti"
import { Button } from "@/components/ui/button"
import { HiOutlineRocketLaunch } from "react-icons/hi2"
import Image from "next/image"
import { deleteUserDrillCompletion } from "@/app/actions/delete-drill-completion"
import { useRouter } from "next/navigation"
import { logger } from "@/lib/logger"

type CourseCompletionProps = {
  courseTitle: string
  courseId: number
}

const CourseCompletion = ({ courseTitle, courseId }: CourseCompletionProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleClaimCourse = async () => {
    setIsLoading(true)
    try {
      await deleteUserDrillCompletion(courseId)
      router.push("/courses")
    } catch (error) {
      logger.error("Error resetting course progress:", { error })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="relative flex items-center justify-center h-[calc(100vh-74px)]
        lg:h-[calc(100vh-24px)] overflow-hidden"
    >
      <Confetti
        width={typeof window !== "undefined" ? window.innerWidth : 1200}
        height={typeof window !== "undefined" ? window.innerHeight : 800}
        recycle={false}
        numberOfPieces={500}
        tweenDuration={10000}
        className="absolute inset-0 z-0"
      />
      <div className="w-full max-w-lg">
        <div className="text-center">
          <Image
            src="/images/icons/trophy.svg"
            alt="trophy"
            className="size-32 text-yellow-500 mx-auto mb-4"
            height={128}
            width={128}
          />
          <div className="text-3xl font-bold dark:text-neutral-300">
            Woo-hoo!
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-2">
            Great job completing the{" "}
            <span className="font-semibold">{courseTitle}</span> course.
          </p>
          <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-6">
            Now, show off your new skills with a shiny new badge!
          </p>
          <Button
            onClick={handleClaimCourse}
            variant="primary"
            disabled={isLoading}
            className="flex items-center mx-auto"
          >
            Explore more courses
            <HiOutlineRocketLaunch className="ml-2 size-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CourseCompletion
