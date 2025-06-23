"use client"

import { useState } from "react"
import Confetti from "react-confetti"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HiOutlineRocketLaunch } from "react-icons/hi2"
import Image from "next/image"
import { deleteUserDrillCompletion } from "@/app/actions/delete-drill-completion"
import { useRouter } from "next/navigation"

type CourseCompletionProps = {
  courseTitle: string
  courseId: number
}

const CourseCompletion = ({ courseTitle, courseId }: CourseCompletionProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleClaimBadge = async () => {
    setIsLoading(true)
    try {
      await deleteUserDrillCompletion(courseId)
      router.push("/courses")
    } catch (error) {
      console.error("Error resetting course progress:", error)
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
      <Card
        className="w-full max-w-lg border-1 px-4 py-10 shadow-lg shadow-neutral-300 dark:border-2
          dark:shadow-neutral-800 dark:bg-black z-10"
      >
        <CardHeader className="text-center">
          <Image
            src="/images/icons/trophy.svg"
            alt="trophy"
            className="size-16 text-yellow-500 mx-auto mb-4"
            height={32}
            width={32}
          />
          <CardTitle className="text-3xl font-bold dark:text-neutral-300">
            Woo-hoo!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-2">
            Great job completing the{" "}
            <span className="font-semibold">{courseTitle}</span> course.
          </p>
          <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-6">
            Now, show off your new skills with a shiny new badge!
          </p>
          <Button
            onClick={handleClaimBadge}
            variant="primary"
            disabled={isLoading}
            className="flex items-center mx-auto"
          >
            Explore more courses
            <HiOutlineRocketLaunch className="ml-2 size-6" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default CourseCompletion
