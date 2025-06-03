"use client"

import { CourseCard } from "@/app/(main)/courses/course-card"
import { upsertUserProgress } from "@/app/actions/user-progress"
import { courses, userProgress } from "@/db/schema"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

type Props = {
  courses: (typeof courses.$inferSelect)[]
  activeCourseId?: typeof userProgress.$inferSelect.activeCourseId
}

export const CourseList = ({ courses, activeCourseId }: Props) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const onClick = (id: number) => {
    if (pending) return

    if (id === activeCourseId) {
      return router.push("/learn")
    }

    startTransition(async () => {
      try {
        await upsertUserProgress(id)
        router.push("/learn")
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message)
        } else {
          toast.error("An unknown error occurred.")
        }
      }
    })
  }

  return (
    <div
      className="grid auto-rows-fr grid-cols-1 gap-3 pt-6 xs:grid-cols-2 sm:gap-4 md:grid-cols-3
        lg:grid-cols-4 xl:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]"
    >
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          id={course.id}
          title={course.title}
          image={course.image}
          onClick={onClick}
          disabled={pending}
          active={course.id === activeCourseId}
        />
      ))}
    </div>
  )
}
