import { getStats, getSubjects } from "@/db/queries"
import { SubjectsList } from "@/app/(main)/courses/subjects-list"

const Page = async () => {
  const subjectsData = getSubjects()
  const statsData = getStats()

  const [subjects, stats] = await Promise.all([subjectsData, statsData])

  const activeSubjectId = stats?.activeSubjectId || null

  return (
    <div className="mx-auto h-full max-w-[912px] px-3">
      <h1 className="text-2xl font-bold text-neutral-700 dark:text-neutral-400">
        Subjects
      </h1>
      <div className="mt-4">
        {subjects.length === 0 ? (
          <p className="text-neutral-500">No subjects available.</p>
        ) : (
          <SubjectsList subjects={subjects} activeSubjectId={activeSubjectId} />
        )}
        {!activeSubjectId && subjects.length > 0 && (
          <p className="mt-4 text-neutral-500">No subject has been selected.</p>
        )}
      </div>
    </div>
  )
}

export default Page
