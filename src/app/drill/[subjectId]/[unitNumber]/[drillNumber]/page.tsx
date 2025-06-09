// File: app/drill/[subjectId]/[unitNumber]/[drillNumber]/page.tsx
import { notFound } from "next/navigation"
import { checkDrillExistence } from "@/app/actions/check-drill-existence"
import { getDrillQuestions, getUserSubscription, getStats } from "@/db/queries"
import app from "@/lib/data/app.json"
import { logger } from "@/lib/logger"
import QuestionsSet from "@/app/drill/[subjectId]/[unitNumber]/[drillNumber]/questions-set"

type Props = {
  params: Promise<{
    subjectId: string
    unitNumber: string
    drillNumber: string
  }>
}

const Page = async ({ params }: Props) => {
  // Await the params Promise to resolve its properties
  const resolvedParams = await params
  const { subjectId, unitNumber, drillNumber } = resolvedParams

  // Convert string params to numbers
  const subjectIdNum = parseInt(subjectId, 10)
  const unitNumberNum = parseInt(unitNumber, 10)
  const drillNumberNum = parseInt(drillNumber, 10)

  // Validate params
  if (isNaN(subjectIdNum) || isNaN(unitNumberNum) || isNaN(drillNumberNum)) {
    notFound()
  }

  // Check if drill exists and is accessible to user
  const { exists, drill, isCurrentDrill, questionsCompleted } =
    await checkDrillExistence(subjectIdNum, unitNumberNum, drillNumberNum)

  // If drill doesn't exist or isn't accessible, trigger 404
  if (!exists || !drill) {
    notFound()
  }

  // Log drill details to console using Winston
  logger.info("Drill details for page", {
    subjectId: subjectIdNum,
    unitNumber: unitNumberNum,
    drillNumber: drillNumberNum,
    drillExists: "Yes",
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

  // Fetch user-specific data
  const userSubscriptionData = await getUserSubscription()
  const userStats = await getStats()

  const initialGemsCount = userStats?.gems ?? 0
  const initialPoints = userStats?.points ?? 0
  const isPro = userSubscriptionData?.isActive ?? false

  return (
    <div className="container mx-auto p-4">
      <QuestionsSet
        questions={questions}
        questionsCompleted={questionsCompleted ?? 0}
        isCurrent={isCurrentDrill}
        isTimed={drill.isTimed}
        initialGemsCount={initialGemsCount}
        initialPoints={initialPoints}
        isPro={isPro}
        initialDrillTitle={drill.title}
        initialDrillNumber={drillNumberNum}
      />
    </div>
  )
}

export default Page
