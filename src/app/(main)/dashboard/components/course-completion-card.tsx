import { Session } from "next-auth"
import Image from "next/image"
import { LiaTimesSolid } from "react-icons/lia"
import { getUserCourseCompletions } from "@/db/queries/courses"

type CourseCompletionCardProps = {
  session: Session | null
}

export async function CourseCompletionCard({
  session,
}: CourseCompletionCardProps) {
  if (!session?.user?.id) {
    return (
      <div className="text-muted-foreground">
        Please sign in to view completed courses.
      </div>
    )
  }

  const completedCourses = await getUserCourseCompletions(session.user.id)

  // Group courses by title and aggregate badge and count
  const courseMap = completedCourses.reduce(
    (acc, course) => {
      if (acc[course.title]) {
        acc[course.title].count += 1
      } else {
        acc[course.title] = { badge: course.badge, count: 1 }
      }
      return acc
    },
    {} as Record<string, { badge: string; count: number }>
  )

  // Convert map to array for rendering
  const uniqueCourses = Object.entries(courseMap).map(
    ([title, { badge, count }]) => ({
      title,
      badge,
      count,
    })
  )

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Courses</h2>
      {uniqueCourses.length === 0 ? (
        <p className="text-muted-foreground">No courses completed yet.</p>
      ) : (
        <ul
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 p-0
            m-0 list-none justify-items-start"
        >
          {uniqueCourses.map((course, index) => (
            <li
              key={index}
              className="flex flex-col items-center gap-2 p-0 m-0"
            >
              <div className="size-12 sm:size-16 p-0 m-0 overflow-hidden">
                <Image
                  src={course.badge}
                  alt={`${course.title} badge`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <span
                className="text-sm sm:text-base text-center inline-flex text-muted-foreground break-words
                  hyphens-auto"
              >
                <span className="flex-shrink min-w-0">{course.title}</span>
                {course.count > 1 && (
                  <span className="text-sm sm:text-base ml-1 inline-flex items-center flex-shrink-0">
                    <LiaTimesSolid className="mr-1 text-xs sm:text-sm" />
                    {course.count}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
