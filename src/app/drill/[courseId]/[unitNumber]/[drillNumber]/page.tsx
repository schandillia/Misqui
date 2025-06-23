import { notFound } from "next/navigation"
import { checkDrillExistence } from "@/app/actions/check-drill-existence"
import { getDrillQuestions, getUserSubscription, getStats } from "@/db/queries"
import app from "@/lib/data/app.json"
import { logger } from "@/lib/logger"
import Drill from "@/app/drill/[courseId]/[unitNumber]/[drillNumber]/components/drill"
import { auth } from "@/auth"

type Props = {
  params: Promise<{
    courseId: string
    unitNumber: string
    drillNumber: string
  }>
}

const Page = async ({ params }: Props) => {
  const session = await auth()
  // Await params before accessing properties
  const { courseId, unitNumber, drillNumber } = await params

  // Convert string params to numbers
  const courseIdNum = parseInt(courseId, 10)
  const unitNumberNum = parseInt(unitNumber, 10)
  const drillNumberNum = parseInt(drillNumber, 10)

  // Validate params
  if (isNaN(courseIdNum) || isNaN(unitNumberNum) || isNaN(drillNumberNum)) {
    logger.warn("Invalid drill parameters", {
      courseId,
      unitNumber,
      drillNumber,
    })
    notFound()
  }

  // Check if drill exists and is accessible to user
  const { exists, drill, isCurrentDrill, questionsCompleted } =
    await checkDrillExistence(courseIdNum, unitNumberNum, drillNumberNum)

  if (!exists || !drill) {
    logger.warn("Drill not found or inaccessible", {
      courseId: courseIdNum,
      unitNumber: unitNumberNum,
      drillNumber: drillNumberNum,
    })
    notFound()
  }

  // Log drill access
  logger.info("Drill page accessed", {
    courseId: courseIdNum,
    unitNumber: unitNumberNum,
    drillNumber: drillNumberNum,
    drillExists: true,
    drillId: drill.id,
    drillTitle: drill.title,
    isTimed: drill.isTimed ? "Yes" : "No",
    isCurrentDrill: isCurrentDrill ? "Yes" : "No",
    questionsCompleted:
      isCurrentDrill && !drill.isTimed ? (questionsCompleted ?? 0) : undefined,
  })

  // Fetch questions for the drill
  const questions = await getDrillQuestions(
    drill.id,
    drill.isTimed,
    isCurrentDrill,
    questionsCompleted,
    app.QUESTIONS_PER_DRILL
  )

  logger.info("Questions fetched for drill", {
    drillId: drill.id,
    questionsCount: questions.length,
    questionIds: questions.map((q) => q.id),
  })

  // Fetch user-specific data
  const userSubscriptionData = session?.user?.id
    ? getUserSubscription(session.user.id)
    : null
  const userStatsData = getStats()
  const [userSubscription, userStats] = await Promise.all([
    userSubscriptionData,
    userStatsData,
  ])

  const initialGemsCount = userStats?.gems ?? 0
  const initialPoints = userStats?.points ?? 0
  const isPro = userSubscription?.isActive ?? false

  return (
    <div className="container mx-auto p-4">
      <Drill
        questions={questions}
        questionsCompleted={questionsCompleted ?? 0}
        isCurrent={isCurrentDrill}
        isTimed={drill.isTimed}
        initialGemsCount={initialGemsCount}
        initialPoints={initialPoints}
        isPro={isPro}
        initialDrillTitle={drill.title}
        initialDrillNumber={drillNumberNum}
        drillId={drill.id}
        courseId={courseIdNum}
      />
    </div>
  )
}

export default Page
