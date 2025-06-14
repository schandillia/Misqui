import Link from "next/link"
import { drills as drillsTable } from "@/db/schema"
import app from "src/lib/data/app.json"
import DrillButton from "@/app/(main)/learn/components/drill-button"
import DrillButtonWrapper from "@/app/(main)/learn/components/drill-button-wrapper"

type DrillType = typeof drillsTable.$inferSelect

type DrillsListProps = {
  drills: DrillType[]
  currentDrillId: number | null
  questionsCompleted: number | null
  subjectId: number
  unitNumber: number
  gems: number
  isPro: boolean
}

const DrillsList = ({
  drills,
  currentDrillId,
  questionsCompleted,
  subjectId,
  unitNumber,
  gems,
  isPro,
}: DrillsListProps) => {
  return (
    <div className="mt-9 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {[...drills]
        .sort((a, b) => a.drill_number - b.drill_number)
        .map((drill, index) => {
          const isUnlocked =
            currentDrillId !== null && drill.id <= currentDrillId
          const isCurrent = drill.id === currentDrillId
          const isTimed = drill.isTimed

          let label: string | null = null
          if (isCurrent) {
            if (questionsCompleted && questionsCompleted > 0 && !isTimed) {
              label = "Resume"
            } else {
              label = "Start"
            }
          }

          const percentage = questionsCompleted
            ? Math.min(
                100,
                (questionsCompleted / app.QUESTIONS_PER_DRILL) * 100
              )
            : 0

          const wrappedButton = (
            <DrillButtonWrapper
              index={index}
              totalCount={drills.length}
              isCompleted={false}
              current={isCurrent}
              label={label}
              drillId={drill.id}
              gems={gems}
              isPro={isPro}
            >
              <DrillButton
                isUnlocked={isUnlocked}
                isCurrent={isCurrent}
                isTimed={isTimed}
                drillNumber={drill.drill_number}
                percentage={percentage}
                disabled={!isUnlocked}
              />
            </DrillButtonWrapper>
          )

          return isUnlocked ? (
            <Link
              key={drill.id}
              href={`/drill/${subjectId}/${unitNumber}/${drill.drill_number}`}
              className="mb-2"
            >
              {wrappedButton}
            </Link>
          ) : (
            <div key={drill.id} className="mb-2">
              {wrappedButton}
            </div>
          )
        })}
    </div>
  )
}

export default DrillsList
