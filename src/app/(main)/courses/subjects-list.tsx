"use client"

import { SubjectCard } from "@/app/(main)/courses/subject-card"
import { upsertStat } from "@/app/actions/update-stats"
import { subjects, stats } from "@/db/schema"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import toast from "react-hot-toast"

type Props = {
  subjects: (typeof subjects.$inferSelect)[]
  activeSubjectId?: typeof stats.$inferSelect.activeSubjectId
}

export const SubjectsList = ({ subjects, activeSubjectId }: Props) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const onClick = (id: number) => {
    if (pending) return

    if (id === activeSubjectId) {
      return router.push("/learn")
    }

    startTransition(async () => {
      try {
        await upsertStat(id)
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
      {subjects.map((subject) => (
        <SubjectCard
          key={subject.id}
          id={subject.id}
          title={subject.title}
          image={subject.image}
          onClick={onClick}
          disabled={pending}
          active={subject.id === activeSubjectId}
        />
      ))}
    </div>
  )
}
