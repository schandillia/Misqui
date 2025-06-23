"use client"

import { useEffect, useState } from "react"
import Confetti from "react-confetti"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { HiOutlineRocketLaunch } from "react-icons/hi2"

type CourseCompletionProps = {
  courseTitle: string
}

const CourseCompletion = ({ courseTitle }: CourseCompletionProps) => {
  const [showConfetti, setShowConfetti] = useState(true)

  // Stop confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className="relative flex items-center justify-center h-[calc(100vh-74px)]
        lg:h-[calc(100vh-24px)] bg-neutral-50 dark:bg-neutral-900 overflow-hidden"
    >
      {showConfetti && (
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 1200}
          height={typeof window !== "undefined" ? window.innerHeight : 800}
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10000}
        />
      )}
      <Card className="w-full max-w-md mx-4 animate-in fade-in-50 z-10 dark:bg-black">
        <CardHeader className="text-center">
          <div
            className="mx-auto size-16 bg-yellow-50 dark:bg-yellow-950 rounded-full flex items-center
              justify-center mb-4"
          >
            <Trophy className="size-10 text-yellow-500" />
          </div>
          <CardTitle className="text-3xl font-bold dark:text-neutral-300">
            Congratulations!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-6">
            You've successfully completed the course!
          </p>
          <Button asChild variant="primary">
            <a href="/courses" className="flex items-center">
              Explore More Courses
              <HiOutlineRocketLaunch className="ml-2 size-6" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default CourseCompletion
