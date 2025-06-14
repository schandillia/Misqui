import { notFound } from "next/navigation"
import { checkDrillExistence } from "@/app/actions/check-drill-existence"
import { getDrillQuestions, getUserSubscription, getStats } from "@/db/queries"
import app from "@/lib/data/app.json"
import { logger } from "@/lib/logger"
import Drill from "@/app/drill/[subjectId]/[unitNumber]/[drillNumber]/components/drill"

type Props = {
  params: Promise<{
    subjectId: string
    unitNumber: string
    drillNumber: string
  }>
}

const Page = async ({ params }: Props) => {
  // Await params before accessing properties
  const { subjectId, unitNumber, drillNumber } = await params

  // Convert string params to numbers
  const subjectIdNum = parseInt(subjectId, 10)
  const unitNumberNum = parseInt(unitNumber, 10)
  const drillNumberNum = parseInt(drillNumber, 10)

  // Validate params
  if (isNaN(subjectIdNum) || isNaN(unitNumberNum) || isNaN(drillNumberNum)) {
    logger.warn("Invalid drill parameters", {
      subjectId,
      unitNumber,
      drillNumber,
    })
    notFound()
  }

  // Check if drill exists and is accessible to user
  const { exists, drill, isCurrentDrill, questionsCompleted } =
    await checkDrillExistence(subjectIdNum, unitNumberNum, drillNumberNum)

  if (!exists || !drill) {
    logger.warn("Drill not found or inaccessible", {
      subjectId: subjectIdNum,
      unitNumber: unitNumberNum,
      drillNumber: drillNumberNum,
    })
    notFound()
  }

  // Log drill access
  logger.info("Drill page accessed", {
    subjectId: subjectIdNum,
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
  const userSubscriptionData = await getUserSubscription()
  const userStats = await getStats()

  const initialGemsCount = userStats?.gems ?? 0
  const initialPoints = userStats?.points ?? 0
  const isPro = userSubscriptionData?.isActive ?? false

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
        subjectId={subjectIdNum}
      />
    </div>
  )
}

export default Page
