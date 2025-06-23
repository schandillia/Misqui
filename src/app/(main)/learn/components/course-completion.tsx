"use client"

import Confetti from "react-confetti"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HiOutlineRocketLaunch } from "react-icons/hi2"
import Image from "next/image"

type CourseCompletionProps = {
  courseTitle: string
}

const CourseCompletion = ({ courseTitle }: CourseCompletionProps) => {
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
          <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-6">
            {courseTitle} is in the bag!
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
